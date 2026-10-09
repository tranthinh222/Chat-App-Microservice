import { randomUUID } from 'node:crypto'
import {
  FRIENDSHIP_EVENT_PRODUCER,
  FRIENDSHIP_EVENT_TYPES,
  type DomainEvent,
  type FriendshipAcceptedData,
  type FriendshipCancelledData,
  type FriendshipRejectedData,
  type FriendshipRemovedData,
  type FriendshipRequestedData,
} from '@chat-app/events'
import {
  Prisma,
  type Friendship,
  type PrismaClient,
} from '../generated/prisma/client.js'
import type {
  CreateFriendRequestData,
  FriendshipRepository,
} from './friendship.repository.js'

type FriendshipDatabase = Pick<PrismaClient, 'friendship' | '$transaction'>

export class PrismaFriendshipRepository implements FriendshipRepository {
  constructor(private readonly database: FriendshipDatabase) {}

  async findById(id: number) {
    return this.database.friendship.findUnique({ where: { id } })
  }

  async findByUsers(userLowId: number, userHighId: number) {
    return this.database.friendship.findUnique({
      where: {
        userLowId_userHighId: {
          userLowId,
          userHighId,
        },
      },
    })
  }

  async createRequest(data: CreateFriendRequestData) {
    return this.database.$transaction(async (transaction) => {
      const friendship = await transaction.friendship.create({ data })
      const receiverId = this.getOtherUserId(friendship, data.requestedById)
      const event = this.createEvent(
        FRIENDSHIP_EVENT_TYPES.requested,
        {
          friendshipId: friendship.id,
          requesterId: data.requestedById,
          receiverId,
        } satisfies FriendshipRequestedData,
      )

      await this.createOutboxEvent(transaction, friendship.id, event)

      return friendship
    })
  }

  async acceptById(id: number) {
    return this.database.$transaction(async (transaction) => {
      const [friendship] = await transaction.friendship.updateManyAndReturn({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      })

      if (!friendship) {
        return null
      }

      const event = this.createEvent(FRIENDSHIP_EVENT_TYPES.accepted, {
        friendshipId: friendship.id,
        requesterId: friendship.requestedById,
        accepterId: this.getOtherUserId(
          friendship,
          friendship.requestedById,
        ),
      } satisfies FriendshipAcceptedData)

      await this.createOutboxEvent(transaction, friendship.id, event)

      return friendship
    })
  }

  async rejectById(
    request: Friendship,
    rejectedById: number,
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const result = await transaction.friendship.deleteMany({
        where: {
          id: request.id,
          status: 'PENDING',
        },
      })

      if (result.count !== 1) {
        return false
      }

      const event = this.createEvent(FRIENDSHIP_EVENT_TYPES.rejected, {
        friendshipId: request.id,
        requesterId: request.requestedById,
        rejecterId: rejectedById,
      } satisfies FriendshipRejectedData)

      await this.createOutboxEvent(transaction, request.id, event)

      return true
    })
  }

  async cancelById(request: Friendship): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const result = await transaction.friendship.deleteMany({
        where: {
          id: request.id,
          status: 'PENDING',
        },
      })

      if (result.count !== 1) {
        return false
      }

      const event = this.createEvent(FRIENDSHIP_EVENT_TYPES.cancelled, {
        friendshipId: request.id,
        requesterId: request.requestedById,
        receiverId: this.getOtherUserId(request, request.requestedById),
      } satisfies FriendshipCancelledData)

      await this.createOutboxEvent(transaction, request.id, event)

      return true
    })
  }

  async removeByUsers(
    userLowId: number,
    userHighId: number,
    removedById: number,
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const friendship = await transaction.friendship.findUnique({
        where: {
          userLowId_userHighId: {
            userLowId,
            userHighId,
          },
        },
      })

      if (!friendship || friendship.status !== 'ACCEPTED') {
        return false
      }

      const result = await transaction.friendship.deleteMany({
        where: {
          id: friendship.id,
          status: 'ACCEPTED',
        },
      })

      if (result.count !== 1) {
        return false
      }

      const event = this.createEvent(FRIENDSHIP_EVENT_TYPES.removed, {
        friendshipId: friendship.id,
        removedById,
        otherUserId: this.getOtherUserId(friendship, removedById),
      } satisfies FriendshipRemovedData)

      await this.createOutboxEvent(transaction, friendship.id, event)

      return true
    })
  }

  async findIncomingRequests(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'PENDING',
        requestedById: { not: userId },
        OR: [{ userLowId: userId }, { userHighId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async findOutgoingRequests(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'PENDING',
        requestedById: userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async findFriends(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userLowId: userId }, { userHighId: userId }],
      },
      orderBy: { acceptedAt: 'desc' },
      take: 100,
    })
  }

  private createEvent<TType extends string, TData>(
    eventType: TType,
    data: TData,
  ): DomainEvent<TType, TData> {
    return {
      eventId: randomUUID(),
      eventType,
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      producer: FRIENDSHIP_EVENT_PRODUCER,
      data,
    }
  }

  private async createOutboxEvent(
    transaction: Prisma.TransactionClient,
    friendshipId: number,
    event: DomainEvent<string, object>,
  ): Promise<void> {
    await transaction.outboxEvent.create({
      data: {
        id: event.eventId,
        aggregateType: 'friendship',
        aggregateId: String(friendshipId),
        eventType: event.eventType,
        payload: event as Prisma.InputJsonObject,
        occurredAt: new Date(event.occurredAt),
      },
    })
  }

  private getOtherUserId(friendship: Friendship, userId: number): number {
    return friendship.userLowId === userId
      ? friendship.userHighId
      : friendship.userLowId
  }
}
