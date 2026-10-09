import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
  type FriendshipEvent,
} from '@chat-app/events'

export type ParsedFriendshipEvent = {
  event: FriendshipEvent
  recipientId: number
}

export function parseFriendshipEvent(value: Buffer | null): ParsedFriendshipEvent {
  if (!value) {
    throw new Error('Friendship event message has no value')
  }

  let candidate: unknown

  try {
    candidate = JSON.parse(value.toString('utf8'))
  } catch {
    throw new Error('Friendship event message is not valid JSON')
  }

  if (!isRecord(candidate) || !isRecord(candidate.data)) {
    throw new Error('Friendship event has an invalid structure')
  }

  if (
    typeof candidate.eventId !== 'string' ||
    candidate.eventId.length === 0 ||
    candidate.eventVersion !== 1 ||
    typeof candidate.occurredAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.occurredAt)) ||
    candidate.producer !== FRIENDSHIP_EVENT_PRODUCER ||
    (candidate.correlationId !== undefined &&
      typeof candidate.correlationId !== 'string')
  ) {
    throw new Error('Friendship event has invalid metadata')
  }

  const data = candidate.data
  requirePositiveInteger(data.friendshipId, 'friendshipId')
  let recipientId: number

  switch (candidate.eventType) {
    case FRIENDSHIP_EVENT_TYPES.requested:
      requirePositiveInteger(data.requesterId, 'requesterId')
      recipientId = requirePositiveInteger(data.receiverId, 'receiverId')
      break
    case FRIENDSHIP_EVENT_TYPES.accepted:
      recipientId = requirePositiveInteger(data.requesterId, 'requesterId')
      requirePositiveInteger(data.accepterId, 'accepterId')
      break
    case FRIENDSHIP_EVENT_TYPES.rejected:
      recipientId = requirePositiveInteger(data.requesterId, 'requesterId')
      requirePositiveInteger(data.rejecterId, 'rejecterId')
      break
    case FRIENDSHIP_EVENT_TYPES.cancelled:
      requirePositiveInteger(data.requesterId, 'requesterId')
      recipientId = requirePositiveInteger(data.receiverId, 'receiverId')
      break
    case FRIENDSHIP_EVENT_TYPES.removed:
      requirePositiveInteger(data.removedById, 'removedById')
      recipientId = requirePositiveInteger(data.otherUserId, 'otherUserId')
      break
    default:
      throw new Error(`Unsupported friendship event type: ${String(candidate.eventType)}`)
  }

  return {
    event: candidate as FriendshipEvent,
    recipientId,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requirePositiveInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new Error(`Friendship event field ${field} must be a positive integer`)
  }

  return Number(value)
}
