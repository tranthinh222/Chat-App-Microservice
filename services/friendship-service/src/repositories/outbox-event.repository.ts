import type { OutboxEvent } from '../generated/prisma/client.js'

export interface OutboxEventRepository {
  findPending(limit: number): Promise<OutboxEvent[]>

  markPublished(id: string, publishedAt: Date): Promise<boolean>

  incrementAttempts(id: string): Promise<number>
}
