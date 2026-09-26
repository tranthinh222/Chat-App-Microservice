import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../errors/app-error.js'

export type AccessTokenRole = 'USER' | 'ADMIN'

export type VerifiedAccessToken = {
  userId: number
  role: AccessTokenRole
  username: string
}

export class TokenService {
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
}

export const tokenService = new TokenService()
