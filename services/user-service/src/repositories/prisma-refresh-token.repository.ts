import type { PrismaClient } from '../generated/prisma/client.js'
import { prisma } from '../config/prisma.js'
import type {
  CreateRefreshTokenData,
  RefreshTokenRepository,
} from './refresh-token.repository.js'

export class PrismaRefreshTokenRepository
  implements RefreshTokenRepository
{
  constructor(private readonly database: PrismaClient) {}

  async create(data: CreateRefreshTokenData) {
    return this.database.refreshToken.create({
      data: {
        token: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    })
  }

  async findByTokenHash(tokenHash: string) {
    return this.database.refreshToken.findUnique({
      where: {
        token: tokenHash,
      },
    })
  }

  async revokeById(id: number) {
    return this.database.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    })
  }
}

export const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma)
