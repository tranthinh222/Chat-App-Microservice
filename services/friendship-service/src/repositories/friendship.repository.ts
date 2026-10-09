import type { Friendship } from '../generated/prisma/client.js'

export type CreateFriendRequestData = {
  userLowId: number
  userHighId: number
  requestedById: number
}

export interface FriendshipRepository {
  findById(id: number): Promise<Friendship | null>

  findByUsers(
    userLowId: number,
    userHighId: number,
  ): Promise<Friendship | null>

  createRequest(data: CreateFriendRequestData): Promise<Friendship>

  acceptById(id: number): Promise<Friendship | null>

  rejectById(request: Friendship, rejectedById: number): Promise<boolean>

  cancelById(request: Friendship): Promise<boolean>

  removeByUsers(
    userLowId: number,
    userHighId: number,
    removedById: number,
  ): Promise<boolean>

  findIncomingRequests(userId: number): Promise<Friendship[]>

  findOutgoingRequests(userId: number): Promise<Friendship[]>

  findFriends(userId: number): Promise<Friendship[]>
}
