import {
  Prisma,
  type PrismaClient,
} from '../generated/prisma/client.js'
import type {
  CreateNotificationData,
  NotificationRepository,
} from './notification.repository.js'

type NotificationDatabase = Pick<PrismaClient, 'notification'>

export class PrismaNotificationRepository
  implements NotificationRepository
{
  constructor(private readonly database: NotificationDatabase) {}

  async create(data: CreateNotificationData) {
    return this.database.notification.create({
      data: {
        eventId: data.eventId,
        recipientId: data.recipientId,
        type: data.type,
        payload: data.payload as Prisma.InputJsonObject,
      },
    })
  }
}
