import { Prisma, type PrismaClient } from '../generated/prisma/client.js'
import type {
  CreateNotificationData,
  NotificationRepository,
} from './notification.repository.js'

export class PrismaNotificationRepository
  implements NotificationRepository
{
  constructor(private readonly database: PrismaClient) {}

  async createIfUnprocessed(data: CreateNotificationData) {
    try {
      return await this.database.$transaction(async (transaction) => {
        await transaction.processedEvent.create({
          data: { eventId: data.eventId },
        })

        return transaction.notification.create({
          data: {
            eventId: data.eventId,
            recipientId: data.recipientId,
            type: data.type,
            payload: data.payload as Prisma.InputJsonObject,
          },
        })
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return null
      }

      throw error
    }
  }
}
