import type { FriendshipEvent } from '@chat-app/events'
import type { NotificationRepository } from '../repositories/notification.repository.js'
import type { RealtimeGateway } from '../realtime/realtime.gateway.js'

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async handleFriendshipEvent(
    event: FriendshipEvent,
    recipientId: number,
  ): Promise<void> {
    const notification = await this.repository.create({
      eventId: event.eventId,
      recipientId,
      type: event.eventType,
      payload: event,
    })

    this.realtimeGateway.emitNotification(recipientId, notification)
  }
}
