import { HttpUserServiceClient } from '../clients/user-service.client.js'
import { OutboxPublisher } from '../messaging/outbox-publisher.js'
import { PrismaFriendshipRepository } from '../repositories/prisma-friendship.repository.js'
import { PrismaOutboxEventRepository } from '../repositories/prisma-outbox-event.repository.js'
import { FriendshipService } from '../services/friendship.service.js'
import { env } from './env.js'
import { kafkaProducer } from './kafka.js'
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

export const outboxEventRepository = new PrismaOutboxEventRepository(prisma)

export const outboxPublisher = new OutboxPublisher(
  outboxEventRepository,
  kafkaProducer,
  {
    batchSize: env.outboxBatchSize,
    pollIntervalMs: env.outboxPollIntervalMs,
    retryBaseDelayMs: env.outboxRetryBaseDelayMs,
    retryMaxDelayMs: env.outboxRetryMaxDelayMs,
  },
)
