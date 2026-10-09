import assert from 'node:assert/strict'
import { createServer, type Server as HttpServer } from 'node:http'
import { after, before, describe, it } from 'node:test'
import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
  type FriendshipRequestedEvent,
} from '@chat-app/events'
import { PrismaPg } from '@prisma/adapter-pg'
import { Kafka, logLevel, type Admin, type Consumer, type Producer } from 'kafkajs'
import { io, type Socket } from 'socket.io-client'
import { PrismaClient } from '../../src/generated/prisma/client.js'
import { FriendshipEventConsumer } from '../../src/messaging/friendship-event.consumer.js'
import { RealtimeGateway } from '../../src/realtime/realtime.gateway.js'
import { PrismaNotificationRepository } from '../../src/repositories/prisma-notification.repository.js'
import { NotificationService } from '../../src/services/notification.service.js'
import type { TokenService } from '../../src/services/token.service.js'

const recipientId = 424_242
const databaseUrl =
  process.env.INTEGRATION_DATABASE_URL ??
  'postgresql://notification_app:notification_app@localhost:5434/notification_db'
const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',')
const suffix = `${Date.now()}-${process.pid}`
const topic = `friendship.events.integration.${suffix}`
const groupId = `notification-integration-${suffix}`
const eventId = `integration-event-${suffix}`

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})
const kafka = new Kafka({
  clientId: `notification-integration-${suffix}`,
  brokers,
  logLevel: logLevel.NOTHING,
})

let admin: Admin
let producer: Producer
let kafkaConsumer: Consumer
let eventConsumer: FriendshipEventConsumer
let realtimeGateway: RealtimeGateway
let httpServer: HttpServer
let socket: Socket

describe('notification flow', { timeout: 30_000 }, () => {
  before(async () => {
    await prisma.$connect()
    await cleanupDatabase()

    admin = kafka.admin()
    producer = kafka.producer()
    kafkaConsumer = kafka.consumer({ groupId })

    await admin.connect()
    await admin.createTopics({
      waitForLeaders: true,
      topics: [{ topic, numPartitions: 1, replicationFactor: 1 }],
    })
    await producer.connect()

    httpServer = createServer()
    const tokenService: TokenService = {
      verifyAccessToken: () => ({
        userId: recipientId,
        role: 'USER',
        username: 'integration-user',
      }),
    }
    realtimeGateway = new RealtimeGateway(
      httpServer,
      tokenService,
      'http://localhost',
    )
    const repository = new PrismaNotificationRepository(prisma)
    const notificationService = new NotificationService(
      repository,
      realtimeGateway,
    )
    eventConsumer = new FriendshipEventConsumer(
      kafkaConsumer,
      notificationService,
      topic,
    )

    const consumerJoined = new Promise<void>((resolve) => {
      kafkaConsumer.on(kafkaConsumer.events.GROUP_JOIN, () => resolve())
    })

    await listen(httpServer)
    await eventConsumer.start()
    await withTimeout(consumerJoined, 10_000, 'Kafka consumer did not join')

    const address = httpServer.address()
    assert(address && typeof address !== 'string')
    socket = io(`http://127.0.0.1:${address.port}`, {
      auth: { token: 'integration-token' },
      transports: ['websocket'],
      forceNew: true,
    })
    await waitForSocketConnection(socket)
  })

  after(async () => {
    socket?.disconnect()
    await eventConsumer?.stop()
    await realtimeGateway?.close()
    await producer?.disconnect()
    await cleanupDatabase()

    if (admin) {
      await admin.deleteGroups([groupId]).catch(() => undefined)
      await admin.deleteTopics({ topics: [topic] }).catch(() => undefined)
      await admin.disconnect()
    }

    await prisma.$disconnect()
  })

  it('stores and emits one notification when Kafka delivers an event twice', async () => {
    const receivedNotifications: unknown[] = []
    socket.on('notification:new', (notification) => {
      receivedNotifications.push(notification)
    })

    const event: FriendshipRequestedEvent = {
      eventId,
      eventType: FRIENDSHIP_EVENT_TYPES.requested,
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      producer: FRIENDSHIP_EVENT_PRODUCER,
      data: {
        friendshipId: 101,
        requesterId: 100,
        receiverId: recipientId,
      },
    }
    const message = {
      key: String(recipientId),
      value: JSON.stringify(event),
    }

    await producer.send({
      topic,
      acks: -1,
      messages: [message, message],
    })

    await waitFor(async () => (await committedOffset()) === '2')

    const notifications = await prisma.notification.findMany({
      where: { eventId },
    })
    const processedEvents = await prisma.processedEvent.findMany({
      where: { eventId },
    })

    assert.equal(notifications.length, 1)
    assert.equal(processedEvents.length, 1)
    assert.equal(receivedNotifications.length, 1)
    assert.deepEqual(receivedNotifications[0], {
      id: notifications[0]?.id,
      eventId,
      type: FRIENDSHIP_EVENT_TYPES.requested,
      payload: event,
      createdAt: notifications[0]?.createdAt.toISOString(),
    })
  })
})

async function committedOffset(): Promise<string | undefined> {
  const offsets = await admin.fetchOffsets({
    groupId,
    topics: [topic],
  })

  return offsets[0]?.partitions[0]?.offset
}

async function cleanupDatabase(): Promise<void> {
  await prisma.notification.deleteMany({ where: { eventId } })
  await prisma.processedEvent.deleteMany({ where: { eventId } })
}

function listen(server: HttpServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })
}

function waitForSocketConnection(client: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    client.once('connect', resolve)
    client.once('connect_error', reject)
  })
}

async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs = 10_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (await condition()) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  throw new Error(`Condition was not met within ${timeoutMs}ms`)
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs)
    }),
  ])
}
