import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type VerifiedAccessToken = {
  userId: number
  role: 'USER' | 'ADMIN'
  username: string
}

export class TokenService {
  verifyAccessToken(token: string): VerifiedAccessToken {
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
  }
}

export const tokenService = new TokenService()
