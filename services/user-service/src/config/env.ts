import 'dotenv/config'
import type { SignOptions } from 'jsonwebtoken'

function getPositiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback)

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`)
  }

  return value
}

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
  refreshTokenExpiresInDays: getPositiveIntegerEnv(
    'REFRESH_TOKEN_EXPIRES_IN_DAYS',
    30,
  ),
}
