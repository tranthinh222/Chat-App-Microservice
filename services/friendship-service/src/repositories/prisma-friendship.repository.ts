import type { PrismaClient } from '../generated/prisma/client.js'
import type {
  CreateFriendRequestData,
  FriendshipRepository,
} from './friendship.repository.js'

type FriendshipDatabase = Pick<PrismaClient, 'friendship'>

export class PrismaFriendshipRepository implements FriendshipRepository {
  constructor(private readonly database: FriendshipDatabase) {}

  async findById(id: number) {
    return this.database.friendship.findUnique({
      where: { id },
    })
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
    return this.database.friendship.create({
      data: {
        userLowId: data.userLowId,
        userHighId: data.userHighId,
        requestedById: data.requestedById,
      },
    })
  }

  async acceptById(id: number) {
    const [friendship] = await this.database.friendship.updateManyAndReturn({
      where: {
        id,
        status: 'PENDING',
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })

    return friendship ?? null
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.database.friendship.deleteMany({
      where: {
        id,
        status: 'PENDING',
      },
    })

    return result.count === 1
  }

  async findIncomingRequests(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'PENDING',
        requestedById: { not: userId },
        OR: [{ userLowId: userId }, { userHighId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOutgoingRequests(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'PENDING',
        requestedById: userId,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findFriends(userId: number) {
    return this.database.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userLowId: userId }, { userHighId: userId }],
      },
      orderBy: { acceptedAt: 'desc' },
    })
  }
}
