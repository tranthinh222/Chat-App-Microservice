import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

type AccessTokenPayload = {
  type: 'access'
}

class TokenService {
  createAccessToken(userId: string): string {
    const payload: AccessTokenPayload = {
      type: 'access',
    }

    return jwt.sign(payload, env.jwtAccessSecret, {
      subject: userId,
      expiresIn: env.jwtAccessExpiresIn,
    })
  }
}

export const tokenService = new TokenService()
