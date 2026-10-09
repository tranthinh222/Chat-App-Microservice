import type { PrismaClient } from '../generated/prisma/client.js'
import type { OutboxEventRepository } from './outbox-event.repository.js'

type OutboxDatabase = Pick<PrismaClient, 'outboxEvent'>

export class PrismaOutboxEventRepository implements OutboxEventRepository {
  constructor(private readonly database: OutboxDatabase) {}

  async findPending(limit: number) {
    return this.database.outboxEvent.findMany({
      where: { publishedAt: null },
      orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
      take: limit,
    })
  }

  async markPublished(id: string, publishedAt: Date): Promise<boolean> {
    const result = await this.database.outboxEvent.updateMany({
      where: { id, publishedAt: null },
      data: { publishedAt },
    })

    return result.count === 1
  }

  async incrementAttempts(id: string): Promise<number> {
    const event = await this.database.outboxEvent.update({
      where: { id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    })

    return event.attempts
  }
}
