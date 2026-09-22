import 'dotenv/config'
import type { SignOptions } from 'jsonwebtoken'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

export const env = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtAccessSecret: getRequiredEnv('JWT_ACCESS_SECRET'),
  jwtAccessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
    '15m') as SignOptions['expiresIn'],
}
