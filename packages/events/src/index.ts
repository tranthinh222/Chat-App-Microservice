export const FRIENDSHIP_EVENT_TYPES = {
  requested: 'friendship.requested.v1',
  accepted: 'friendship.accepted.v1',
  rejected: 'friendship.rejected.v1',
  cancelled: 'friendship.cancelled.v1',
  removed: 'friendship.removed.v1',
} as const;

export const FRIENDSHIP_EVENTS_TOPIC = 'friendship.events.v1' as const;
export const FRIENDSHIP_EVENT_PRODUCER = 'friendship-service' as const;

export type FriendshipEventType =
  (typeof FRIENDSHIP_EVENT_TYPES)[keyof typeof FRIENDSHIP_EVENT_TYPES];

export type DomainEvent<TType extends string, TData> = {
  eventId: string;
  eventType: TType;
  eventVersion: 1;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  data: TData;
};

export type FriendshipRequestedData = {
  friendshipId: number;
  requesterId: number;
  receiverId: number;
};

export type FriendshipAcceptedData = {
  friendshipId: number;
  requesterId: number;
  accepterId: number;
};

export type FriendshipRejectedData = {
  friendshipId: number;
  requesterId: number;
  rejecterId: number;
};

export type FriendshipCancelledData = {
  friendshipId: number;
  requesterId: number;
  receiverId: number;
};

export type FriendshipRemovedData = {
  friendshipId: number;
  removedById: number;
  otherUserId: number;
};

export type FriendshipRequestedEvent = DomainEvent<
  typeof FRIENDSHIP_EVENT_TYPES.requested,
  FriendshipRequestedData
>;

export type FriendshipAcceptedEvent = DomainEvent<
  typeof FRIENDSHIP_EVENT_TYPES.accepted,
  FriendshipAcceptedData
>;

export type FriendshipRejectedEvent = DomainEvent<
  typeof FRIENDSHIP_EVENT_TYPES.rejected,
  FriendshipRejectedData
>;

export type FriendshipCancelledEvent = DomainEvent<
  typeof FRIENDSHIP_EVENT_TYPES.cancelled,
  FriendshipCancelledData
>;

export type FriendshipRemovedEvent = DomainEvent<
  typeof FRIENDSHIP_EVENT_TYPES.removed,
  FriendshipRemovedData
>;

export type FriendshipEvent =
  | FriendshipRequestedEvent
  | FriendshipAcceptedEvent
  | FriendshipRejectedEvent
  | FriendshipCancelledEvent
  | FriendshipRemovedEvent;
