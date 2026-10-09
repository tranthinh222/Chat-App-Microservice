import { FRIENDSHIP_EVENTS_TOPIC } from '@chat-app/events'
import type { Consumer, EachMessagePayload } from 'kafkajs'
import type { NotificationService } from '../services/notification.service.js'
import { parseFriendshipEvent } from './friendship-event.parser.js'

export class FriendshipEventConsumer {
  private running = false
  private runPromise?: Promise<void>

  constructor(
    private readonly consumer: Consumer,
    private readonly notificationService: NotificationService,
    private readonly topic = FRIENDSHIP_EVENTS_TOPIC,
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      return
    }

    await this.consumer.connect()
    await this.consumer.subscribe({
      topic: this.topic,
      fromBeginning: false,
    })

    this.running = true
    this.runPromise = this.consumer.run({
      autoCommit: false,
      eachMessage: (payload) => this.handleMessage(payload),
    })
    void this.runPromise.catch((error: unknown) => {
      if (this.running) {
        console.error('Friendship event consumer stopped unexpectedly', error)
      }
    })
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return
    }

    this.running = false
    await this.consumer.stop()
    await this.runPromise
    this.runPromise = undefined
    await this.consumer.disconnect()
  }

  private async handleMessage({
    topic,
    partition,
    message,
  }: EachMessagePayload): Promise<void> {
    const { event, recipientId } = parseFriendshipEvent(message.value)

    await this.notificationService.handleFriendshipEvent(event, recipientId)
    await this.consumer.commitOffsets([
      {
        topic,
        partition,
        offset: (BigInt(message.offset) + 1n).toString(),
      },
    ])
  }
}
