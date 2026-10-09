import assert from 'node:assert/strict'
import { createServer, type Server as HttpServer } from 'node:http'
import { describe, it } from 'node:test'
import { io, type Socket } from 'socket.io-client'
import type { Notification } from '../src/generated/prisma/client.js'
import { RealtimeGateway } from '../src/realtime/realtime.gateway.js'
import type { TokenService } from '../src/services/token.service.js'

const userId = 123
const notification: Notification = {
  id: 'notification-1',
  eventId: 'event-1',
  recipientId: userId,
  type: 'friendship.requested.v1',
  payload: { eventId: 'event-1' },
  readAt: null,
  createdAt: new Date('2026-10-10T10:00:00.000Z'),
}

describe('RealtimeGateway', () => {
  it('returns false when the recipient is offline', async () => {
    const fixture = await createFixture()

    try {
      assert.equal(fixture.gateway.emitNotification(userId, notification), false)
    } finally {
      await fixture.close()
    }
  })

  it('rejects a socket without a valid access token', async () => {
    const fixture = await createFixture()
    const socket = io(fixture.url, {
      transports: ['websocket'],
      forceNew: true,
    })

    try {
      const error = await new Promise<Error>((resolve) => {
        socket.once('connect_error', resolve)
      })

      assert.equal(error.message, 'Unauthorized')
      assert.equal(socket.connected, false)
    } finally {
      socket.disconnect()
      await fixture.close()
    }
  })

  it('emits a notification to the authenticated user room', async () => {
    const fixture = await createFixture()
    const socket = io(fixture.url, {
      auth: { token: 'valid-token' },
      transports: ['websocket'],
      forceNew: true,
    })

    try {
      await waitForConnection(socket)
      const received = new Promise<unknown>((resolve) => {
        socket.once('notification:new', resolve)
      })

      assert.equal(fixture.gateway.emitNotification(userId, notification), true)
      assert.deepEqual(await received, {
        id: notification.id,
        eventId: notification.eventId,
        type: notification.type,
        payload: notification.payload,
        createdAt: notification.createdAt.toISOString(),
      })
    } finally {
      socket.disconnect()
      await fixture.close()
    }
  })
})

async function createFixture(): Promise<{
  gateway: RealtimeGateway
  url: string
  close: () => Promise<void>
}> {
  const server = createServer()
  const tokenService: TokenService = {
    verifyAccessToken(token: string) {
      if (token !== 'valid-token') {
        throw new Error('Invalid token')
      }

      return { userId, role: 'USER', username: 'test-user' }
    },
  }
  const gateway = new RealtimeGateway(
    server,
    tokenService,
    'http://localhost',
  )
  await listen(server)
  const address = server.address()
  assert(address && typeof address !== 'string')

  return {
    gateway,
    url: `http://127.0.0.1:${address.port}`,
    close: () => closeGateway(gateway, server),
  }
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

function waitForConnection(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('connect_error', reject)
  })
}

async function closeGateway(
  gateway: RealtimeGateway,
  server: HttpServer,
): Promise<void> {
  await gateway.close()

  if (server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}
