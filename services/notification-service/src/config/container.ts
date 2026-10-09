import type { Server as HttpServer } from 'node:http'
import { FriendshipEventConsumer } from '../messaging/friendship-event.consumer.js'
import { RealtimeGateway } from '../realtime/realtime.gateway.js'
import { PrismaNotificationRepository } from '../repositories/prisma-notification.repository.js'
import { NotificationService } from '../services/notification.service.js'
import { tokenService } from '../services/token.service.js'
import { env } from './env.js'
import { friendshipEventKafkaConsumer } from './kafka.js'
import { prisma } from './prisma.js'

export function createNotificationRuntime(server: HttpServer) {
  const realtimeGateway = new RealtimeGateway(
    server,
    tokenService,
    env.corsAllowedOrigin,
  )
  const notificationRepository = new PrismaNotificationRepository(prisma)
  const notificationService = new NotificationService(
    notificationRepository,
    realtimeGateway,
  )
  const friendshipEventConsumer = new FriendshipEventConsumer(
    friendshipEventKafkaConsumer,
    notificationService,
  )

  return {
    friendshipEventConsumer,
    realtimeGateway,
  }
}
