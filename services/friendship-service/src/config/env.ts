import 'dotenv/config'

function getPort(): number {
  const port = Number(process.env.PORT ?? 3002)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('Environment variable PORT must be a valid port number')
  }

  return port
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }

  return value
}

function getPositiveIntegerEnvironmentVariable(
  name: string,
  fallback: number,
): number {
  const value = Number(process.env[name] ?? fallback)

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`)
  }

  return value
}

function getCommaSeparatedEnvironmentVariable(
  name: string,
  fallback: string,
): string[] {
  const values = (process.env[name] ?? fallback)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (values.length === 0) {
    throw new Error(`Environment variable ${name} must contain a value`)
  }

  return values
}

export const env = {
  port: getPort(),
  databaseUrl: getRequiredEnvironmentVariable('DATABASE_URL'),
  jwtAccessSecret: getRequiredEnvironmentVariable('JWT_ACCESS_SECRET'),
  userServiceUrl: getRequiredEnvironmentVariable('USER_SERVICE_URL'),
  userServiceRequestTimeoutMs: getPositiveIntegerEnvironmentVariable(
    'USER_SERVICE_REQUEST_TIMEOUT_MS',
    3000,
  ),
  kafkaBrokers: getCommaSeparatedEnvironmentVariable(
    'KAFKA_BROKERS',
    'localhost:9092',
  ),
  kafkaClientId:
    process.env.KAFKA_CLIENT_ID?.trim() || 'friendship-service',
  outboxBatchSize: getPositiveIntegerEnvironmentVariable(
    'OUTBOX_BATCH_SIZE',
    50,
  ),
  outboxPollIntervalMs: getPositiveIntegerEnvironmentVariable(
    'OUTBOX_POLL_INTERVAL_MS',
    1000,
  ),
  outboxRetryBaseDelayMs: getPositiveIntegerEnvironmentVariable(
    'OUTBOX_RETRY_BASE_DELAY_MS',
    1000,
  ),
  outboxRetryMaxDelayMs: getPositiveIntegerEnvironmentVariable(
    'OUTBOX_RETRY_MAX_DELAY_MS',
    30_000,
  ),
}
