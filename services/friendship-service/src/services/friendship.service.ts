import { Prisma } from '../generated/prisma/client.js'
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
}
