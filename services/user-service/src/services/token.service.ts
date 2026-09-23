import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../errors/app-errors.js'
import type { Role } from '../generated/prisma/client.js'
import { randomBytes } from 'node:crypto'

type AccessTokenPayload = {
  type: 'access'
  role: Role
  username: string
}

type CreateAccessTokenInput = {
  userId: number
  role: Role
  username: string
}

export type VerifiedAccessToken = {
  userId: number
  role: Role
  username: string
}

class TokenService {
  createAccessToken(input: CreateAccessTokenInput): string {
    const payload: AccessTokenPayload = {
      type: 'access',
      role: input.role,
      username: input.username,
    }

    return jwt.sign(payload, env.jwtAccessSecret, {
      subject: String(input.userId),
      expiresIn: env.jwtAccessExpiresIn,
      algorithm: 'HS256',
    })
  }

  verifyAccessToken(token: string): VerifiedAccessToken {
    try {
      const decoded = jwt.verify(token, env.jwtAccessSecret, {
        algorithms: ['HS256'],
      })

      if (
        typeof decoded === 'string' ||
        decoded.type !== 'access' ||
        typeof decoded.sub !== 'string' ||
        typeof decoded.username !== 'string' ||
        (decoded.role !== 'USER' && decoded.role !== 'ADMIN')
      ) {
        throw new Error('Invalid access token payload')
      }

      const userId = Number(decoded.sub)

      if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new Error('Invalid access token subject')
      }

      return {
        userId,
        role: decoded.role,
        username: decoded.username,
      }
    } catch {
      throw new AppError(
        401,
        'INVALID_ACCESS_TOKEN',
        'Access token is invalid or expired',
      )
    }
  }
  createRefreshToken(): string {
    return randomBytes(48).toString('base64url')
  }
}

export const tokenService = new TokenService()
