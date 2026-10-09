import {
  FRIENDSHIP_EVENTS_TOPIC,
  FRIENDSHIP_EVENT_TYPES,
} from '@chat-app/events'
import type { Producer } from 'kafkajs'
import type { OutboxEvent } from '../generated/prisma/client.js'
import type { OutboxEventRepository } from '../repositories/outbox-event.repository.js'

type OutboxPublisherOptions = {
  batchSize: number
  pollIntervalMs: number
  retryBaseDelayMs: number
  retryMaxDelayMs: number
  topic?: string
}

export class OutboxPublisher {
  private running = false
  private connected = false
  private loopPromise?: Promise<void>
  private wakeUp?: () => void

  constructor(
    private readonly repository: OutboxEventRepository,
    private readonly producer: Producer,
    private readonly options: OutboxPublisherOptions,
  ) {}

  start(): void {
    if (this.running) {
      return
    }

    this.running = true
    this.loopPromise = this.run()
  }

  async stop(): Promise<void> {
    if (!this.running && !this.loopPromise) {
      return
    }

    this.running = false
    this.wakeUp?.()
    await this.loopPromise
    this.loopPromise = undefined

    if (this.connected) {
      await this.producer.disconnect()
      this.connected = false
    }
  }

  private async run(): Promise<void> {
    while (this.running) {
      try {
        const events = await this.repository.findPending(this.options.batchSize)

        if (events.length === 0) {
          await this.wait(this.options.pollIntervalMs)
          continue
        }

        for (const event of events) {
          if (!this.running) {
            break
          }

          const published = await this.publish(event)

          if (!published) {
            break
          }
        }
      } catch (error) {
        console.error('Outbox publisher loop failed', error)
        await this.wait(this.options.retryBaseDelayMs)
      }
    }
  }

  private async publish(event: OutboxEvent): Promise<boolean> {
    try {
      await this.connect()
      await this.producer.send({
        topic: this.options.topic ?? FRIENDSHIP_EVENTS_TOPIC,
        acks: -1,
        messages: [
          {
            key: this.getMessageKey(event),
            value: JSON.stringify(event.payload),
            headers: {
              eventId: event.id,
              eventType: event.eventType,
            },
          },
        ],
      })

      const marked = await this.repository.markPublished(event.id, new Date())

      if (!marked) {
        console.warn(`Outbox event ${event.id} was already marked as published`)
      }

      return true
    } catch (error) {
      let attempts = event.attempts + 1

      try {
        attempts = await this.repository.incrementAttempts(event.id)
      } catch (attemptError) {
        console.error(
          `Failed to increment attempts for outbox event ${event.id}`,
          attemptError,
        )
      }

      console.error(
        `Failed to publish outbox event ${event.id}; attempt ${attempts}`,
        error,
      )
      await this.wait(this.getRetryDelay(attempts))

      return false
    }
  }

  private async connect(): Promise<void> {
    if (this.connected) {
      return
    }

    await this.producer.connect()
    this.connected = true
  }

  private getMessageKey(event: OutboxEvent): string {
    const data = this.getEventData(event)
    let recipientId: unknown

    switch (event.eventType) {
      case FRIENDSHIP_EVENT_TYPES.requested:
      case FRIENDSHIP_EVENT_TYPES.cancelled:
        recipientId = data.receiverId
        break
      case FRIENDSHIP_EVENT_TYPES.accepted:
      case FRIENDSHIP_EVENT_TYPES.rejected:
        recipientId = data.requesterId
        break
      case FRIENDSHIP_EVENT_TYPES.removed:
        recipientId = data.otherUserId
        break
      default:
        throw new Error(`Unsupported friendship event type: ${event.eventType}`)
    }

    if (!Number.isSafeInteger(recipientId) || Number(recipientId) <= 0) {
      throw new Error(`Outbox event ${event.id} has an invalid receiver ID`)
    }

    return String(recipientId)
  }

  private getEventData(event: OutboxEvent): Record<string, unknown> {
    const payload = event.payload

    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload) ||
      !('data' in payload) ||
      typeof payload.data !== 'object' ||
      payload.data === null ||
      Array.isArray(payload.data)
    ) {
      throw new Error(`Outbox event ${event.id} has an invalid payload`)
    }

    return payload.data as Record<string, unknown>
  }

  private getRetryDelay(attempts: number): number {
    const exponent = Math.min(Math.max(attempts - 1, 0), 30)

    return Math.min(
      this.options.retryBaseDelayMs * 2 ** exponent,
      this.options.retryMaxDelayMs,
    )
  }

  private wait(delayMs: number): Promise<void> {
    if (!this.running) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.wakeUp = undefined
        resolve()
      }, delayMs)

      this.wakeUp = () => {
        clearTimeout(timeout)
        this.wakeUp = undefined
        resolve()
      }
    })
  }
}
