import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
  type FriendshipRequestedEvent,
} from '@chat-app/events'
import type { Notification } from '../src/generated/prisma/client.js'
import type { RealtimeGateway } from '../src/realtime/realtime.gateway.js'
import type {
  CreateNotificationData,
  NotificationRepository,
} from '../src/repositories/notification.repository.js'
import { NotificationService } from '../src/services/notification.service.js'

const event: FriendshipRequestedEvent = {
  eventId: 'event-1',
  eventType: FRIENDSHIP_EVENT_TYPES.requested,
  eventVersion: 1,
  occurredAt: '2026-10-10T10:00:00.000Z',
  producer: FRIENDSHIP_EVENT_PRODUCER,
  data: { friendshipId: 1, requesterId: 10, receiverId: 20 },
}

const notification: Notification = {
  id: 'notification-1',
  eventId: event.eventId,
  recipientId: 20,
  type: event.eventType,
  payload: event,
  readAt: null,
  createdAt: new Date('2026-10-10T10:00:01.000Z'),
}

describe('NotificationService', () => {
  it('stores a new event before emitting it in realtime', async () => {
    const calls: string[] = []
    let storedData: CreateNotificationData | undefined
    const repository: NotificationRepository = {
      async createIfUnprocessed(data) {
        calls.push('store')
        storedData = data
        return notification
      },
    }
    const gateway = {
      emitNotification(recipientId: number, emitted: Notification) {
        calls.push('emit')
        assert.equal(recipientId, 20)
        assert.equal(emitted, notification)
        return true
      },
    } as RealtimeGateway
    const service = new NotificationService(repository, gateway)

    await service.handleFriendshipEvent(event, 20)

    assert.deepEqual(calls, ['store', 'emit'])
    assert.deepEqual(storedData, {
      eventId: event.eventId,
      recipientId: 20,
      type: event.eventType,
      payload: event,
    })
  })

  it('does not emit a duplicate event', async () => {
    let emitted = false
    const repository: NotificationRepository = {
      async createIfUnprocessed() {
        return null
      },
    }
    const gateway = {
      emitNotification() {
        emitted = true
        return true
      },
    } as unknown as RealtimeGateway
    const service = new NotificationService(repository, gateway)

    await service.handleFriendshipEvent(event, 20)

    assert.equal(emitted, false)
  })
})
