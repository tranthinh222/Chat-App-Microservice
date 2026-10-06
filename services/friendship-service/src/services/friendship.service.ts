import { Prisma, type Friendship } from '../generated/prisma/client.js'
import { AppError } from '../errors/app-error.js'
import type { UserServiceClient } from '../clients/user-service.client.js'
import type { FriendshipRepository } from '../repositories/friendship.repository.js'

export class FriendshipService {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  async sendFriendRequest(
    senderId: number,
    receiverId: number,
    accessToken: string,
  ) {
    if (senderId === receiverId) {
      throw new AppError(
        400,
        'CANNOT_FRIEND_YOURSELF',
        'You cannot send a friend request to yourself',
      )
    }

    await this.userServiceClient.findActiveUserById(receiverId, accessToken)

    const userLowId = Math.min(senderId, receiverId)
    const userHighId = Math.max(senderId, receiverId)
    const existingFriendship = await this.friendshipRepository.findByUsers(
      userLowId,
      userHighId,
    )

    if (existingFriendship?.status === 'ACCEPTED') {
      throw new AppError(409, 'ALREADY_FRIENDS', 'Users are already friends')
    }

    if (existingFriendship) {
      throw new AppError(
        409,
        'FRIEND_REQUEST_ALREADY_EXISTS',
        'A friend request already exists',
      )
    }

    try {
      return await this.friendshipRepository.createRequest({
        userLowId,
        userHighId,
        requestedById: senderId,
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(
          409,
          'FRIEND_REQUEST_ALREADY_EXISTS',
          'A friend request already exists',
        )
      }

      throw error
    }
  }
  async acceptFriendRequest(requestId: number, userId: number) {
    const request = await this.getRequestForAction(requestId)
    this.ensureReceiver(request, userId)
    this.ensurePending(request)

    const acceptedRequest = await this.friendshipRepository.acceptById(
      requestId,
    )

    if (!acceptedRequest) {
      throw new AppError(
        409,
        'FRIEND_REQUEST_NOT_PENDING',
        'Friend request is no longer pending',
      )
    }

    return acceptedRequest
  }

  async rejectFriendRequest(requestId: number, userId: number): Promise<void> {
    const request = await this.getRequestForAction(requestId)
    this.ensureReceiver(request, userId)
    this.ensurePending(request)

    const deleted = await this.friendshipRepository.deleteById(requestId)

    if (!deleted) {
      throw new AppError(
        409,
        'FRIEND_REQUEST_NOT_PENDING',
        'Friend request is no longer pending',
      )
    }
  }

  async cancelFriendRequest(requestId: number, userId: number): Promise<void> {
    const request = await this.getRequestForAction(requestId)

    if (request.requestedById !== userId) {
      throw new AppError(
        403,
        'FRIEND_REQUEST_ACTION_FORBIDDEN',
        'You are not allowed to cancel this friend request',
      )
    }

    this.ensurePending(request)

    const deleted = await this.friendshipRepository.deleteById(requestId)

    if (!deleted) {
      throw new AppError(
        409,
        'FRIEND_REQUEST_NOT_PENDING',
        'Friend request is no longer pending',
      )
    }
  }

  private async getRequestForAction(requestId: number) {
    const request = await this.friendshipRepository.findById(requestId)

    if (!request) {
      throw new AppError(
        404,
        'FRIEND_REQUEST_NOT_FOUND',
        'Friend request not found',
      )
    }

    return request
  }

  private ensureReceiver(
    request: Friendship,
    userId: number,
  ): void {
    const receiverId =
      request.requestedById === request.userLowId
        ? request.userHighId
        : request.userLowId

    if (receiverId !== userId) {
      throw new AppError(
        403,
        'FRIEND_REQUEST_ACTION_FORBIDDEN',
        'You are not allowed to modify this friend request',
      )
    }
  }

  private ensurePending(
    request: Friendship,
  ): void {
    if (request.status !== 'PENDING') {
      throw new AppError(
        409,
        'FRIEND_REQUEST_NOT_PENDING',
        'Friend request is no longer pending',
      )
    }
  }

}
