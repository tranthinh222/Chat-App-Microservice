import type { Friendship } from '../generated/prisma/client.js'

export type CreateFriendRequestData = {
  userLowId: number
  userHighId: number
  requestedById: number
}

export interface FriendshipRepository {
  findByUsers(
    userLowId: number,
    userHighId: number,
  ): Promise<Friendship | null>

  createRequest(data: CreateFriendRequestData): Promise<Friendship>

  acceptById(id: number): Promise<Friendship>

  deleteById(id: number): Promise<void>

  findIncomingRequests(userId: number): Promise<Friendship[]>

  findOutgoingRequests(userId: number): Promise<Friendship[]>

  findFriends(userId: number): Promise<Friendship[]>
}
