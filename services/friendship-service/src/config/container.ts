import { HttpUserServiceClient } from '../clients/user-service.client.js'
import { PrismaFriendshipRepository } from '../repositories/prisma-friendship.repository.js'
import { FriendshipService } from '../services/friendship.service.js'
import { env } from './env.js'
import { prisma } from './prisma.js'

export const userServiceClient = new HttpUserServiceClient(
  env.userServiceUrl,
  env.userServiceRequestTimeoutMs,
)

export const friendshipRepository = new PrismaFriendshipRepository(prisma)

export const friendshipService = new FriendshipService(
  friendshipRepository,
  userServiceClient,
)
