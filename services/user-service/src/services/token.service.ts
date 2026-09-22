import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { Role } from '../generated/prisma/client.js'

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
    })
  }
}

export const tokenService = new TokenService()
