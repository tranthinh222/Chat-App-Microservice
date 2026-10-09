import 'dotenv/config'

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }

  return value
}

function getPort(): number {
  const port = Number(process.env.PORT ?? 3003)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('Environment variable PORT must be a valid port number')
  }

  return port
}

function getKafkaBrokers(): string[] {
  const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean)

  if (brokers.length === 0) {
    throw new Error('Environment variable KAFKA_BROKERS must contain a value')
  }

  return brokers
}

export const env = {
  port: getPort(),
  databaseUrl: getRequiredEnvironmentVariable('DATABASE_URL'),
  jwtAccessSecret: getRequiredEnvironmentVariable('JWT_ACCESS_SECRET'),
  corsAllowedOrigin:
    process.env.CORS_ALLOWED_ORIGIN?.trim() || 'http://localhost:5173',
  kafkaBrokers: getKafkaBrokers(),
  kafkaClientId:
    process.env.KAFKA_CLIENT_ID?.trim() || 'notification-service',
  kafkaConsumerGroupId:
    process.env.KAFKA_CONSUMER_GROUP_ID?.trim() ||
    'notification-service-v1',
}
