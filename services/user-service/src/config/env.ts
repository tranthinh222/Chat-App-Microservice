import 'dotenv/config'

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
}
