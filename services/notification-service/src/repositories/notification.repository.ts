import type { Notification } from '../generated/prisma/client.js'

export type CreateNotificationData = {
  eventId: string
  recipientId: number
  type: string
  payload: object
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>
}
