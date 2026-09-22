import jwt from 'jsonwebtoken'

type AccessTokenPayload = {
  type: 'access'
}

class TokenService {
  createAccessToken(userId: string): string {
    const secret = process.env.JWT_ACCESS_SECRET

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is missing')
    }

    const payload: AccessTokenPayload = {
      type: 'access',
    }

    return jwt.sign(payload, secret, {
      subject: userId,
      expiresIn: '15m',
    })
  }
}

export const tokenService = new TokenService()
