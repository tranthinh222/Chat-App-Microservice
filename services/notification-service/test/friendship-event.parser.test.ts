import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
} from '@chat-app/events'
import { parseFriendshipEvent } from '../src/messaging/friendship-event.parser.js'

const metadata = {
  eventId: 'event-1',
  eventVersion: 1,
  occurredAt: '2026-10-10T10:00:00.000Z',
  producer: FRIENDSHIP_EVENT_PRODUCER,
}

describe('parseFriendshipEvent', () => {
  const cases = [
    {
      name: 'friend request receiver',
      eventType: FRIENDSHIP_EVENT_TYPES.requested,
      data: { friendshipId: 1, requesterId: 10, receiverId: 20 },
      recipientId: 20,
    },
    {
      name: 'friend request sender after acceptance',
      eventType: FRIENDSHIP_EVENT_TYPES.accepted,
      data: { friendshipId: 1, requesterId: 10, accepterId: 20 },
      recipientId: 10,
    },
    {
      name: 'friend request sender after rejection',
      eventType: FRIENDSHIP_EVENT_TYPES.rejected,
      data: { friendshipId: 1, requesterId: 10, rejecterId: 20 },
      recipientId: 10,
    },
    {
      name: 'friend request receiver after cancellation',
      eventType: FRIENDSHIP_EVENT_TYPES.cancelled,
      data: { friendshipId: 1, requesterId: 10, receiverId: 20 },
      recipientId: 20,
    },
    {
      name: 'other user after friendship removal',
      eventType: FRIENDSHIP_EVENT_TYPES.removed,
      data: { friendshipId: 1, removedById: 10, otherUserId: 20 },
      recipientId: 20,
    },
  ] as const

  for (const testCase of cases) {
    it(`selects the ${testCase.name}`, () => {
      const event = {
        ...metadata,
        eventType: testCase.eventType,
        data: testCase.data,
      }

      const result = parseFriendshipEvent(
        Buffer.from(JSON.stringify(event)),
      )

      assert.equal(result.recipientId, testCase.recipientId)
      assert.deepEqual(result.event, event)
    })
  }

  it('rejects an invalid event payload', () => {
    const event = {
      ...metadata,
      eventType: FRIENDSHIP_EVENT_TYPES.requested,
      data: { friendshipId: 1, requesterId: 10, receiverId: 0 },
    }

    assert.throws(
      () => parseFriendshipEvent(Buffer.from(JSON.stringify(event))),
      /receiverId must be a positive integer/,
    )
  })

  it('rejects malformed JSON', () => {
    assert.throws(
      () => parseFriendshipEvent(Buffer.from('{invalid')),
      /not valid JSON/,
    )
  })
})
