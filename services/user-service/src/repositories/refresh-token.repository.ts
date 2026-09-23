import type { RefreshToken } from '../generated/prisma/client.js'

export type CreateRefreshTokenData = {
  tokenHash: string
  userId: number
  expiresAt: Date
}

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshToken>

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>

  revokeById(id: number): Promise<RefreshToken>
}
