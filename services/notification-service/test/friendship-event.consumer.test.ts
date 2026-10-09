import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
} from '@chat-app/events'
import type {
  Consumer,
  ConsumerRunConfig,
  EachMessagePayload,
} from 'kafkajs'
import { FriendshipEventConsumer } from '../src/messaging/friendship-event.consumer.js'
import type { NotificationService } from '../src/services/notification.service.js'

const event = {
  eventId: 'event-1',
  eventType: FRIENDSHIP_EVENT_TYPES.requested,
  eventVersion: 1,
  occurredAt: '2026-10-10T10:00:00.000Z',
  producer: FRIENDSHIP_EVENT_PRODUCER,
  data: { friendshipId: 1, requesterId: 10, receiverId: 20 },
}

function messagePayload(): EachMessagePayload {
  return {
    topic: 'friendship.events.test',
    partition: 2,
    message: {
      key: null,
      value: Buffer.from(JSON.stringify(event)),
      timestamp: '0',
      attributes: 0,
      offset: '7',
      headers: {},
    },
    heartbeat: async () => undefined,
    pause: () => () => undefined,
  }
}

describe('FriendshipEventConsumer', () => {
  it('commits the next offset after successful processing', async () => {
    let eachMessage: ConsumerRunConfig['eachMessage']
    const committedOffsets: unknown[] = []
    const consumer = {
      connect: async () => undefined,
      subscribe: async () => undefined,
      run: async (config: ConsumerRunConfig) => {
        eachMessage = config.eachMessage
      },
      commitOffsets: async (offsets: unknown) => {
        committedOffsets.push(offsets)
      },
    } as unknown as Consumer
    const notificationService = {
      handleFriendshipEvent: async () => undefined,
    } as unknown as NotificationService
    const subject = new FriendshipEventConsumer(
      consumer,
      notificationService,
      'friendship.events.test',
    )

    await subject.start()
    await eachMessage!(messagePayload())

    assert.deepEqual(committedOffsets, [
      [
        {
          topic: 'friendship.events.test',
          partition: 2,
          offset: '8',
        },
      ],
    ])
  })

  it('does not commit the offset when processing fails', async () => {
    let eachMessage: ConsumerRunConfig['eachMessage']
    let committed = false
    const consumer = {
      connect: async () => undefined,
      subscribe: async () => undefined,
      run: async (config: ConsumerRunConfig) => {
        eachMessage = config.eachMessage
      },
      commitOffsets: async () => {
        committed = true
      },
    } as unknown as Consumer
    const notificationService = {
      handleFriendshipEvent: async () => {
        throw new Error('database unavailable')
      },
    } as unknown as NotificationService
    const subject = new FriendshipEventConsumer(
      consumer,
      notificationService,
      'friendship.events.test',
    )

    await subject.start()

    await assert.rejects(
      () => eachMessage!(messagePayload()),
      /database unavailable/,
    )
    assert.equal(committed, false)
  })
})
