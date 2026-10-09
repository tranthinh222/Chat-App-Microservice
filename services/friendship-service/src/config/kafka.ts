import { Kafka, logLevel, Partitioners } from 'kafkajs'
import { env } from './env.js'

const kafka = new Kafka({
  clientId: env.kafkaClientId,
  brokers: env.kafkaBrokers,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
})

export const kafkaProducer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
  maxInFlightRequests: 1,
})
