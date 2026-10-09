import { Kafka, logLevel } from 'kafkajs'
import { env } from './env.js'

const kafka = new Kafka({
  clientId: env.kafkaClientId,
  brokers: env.kafkaBrokers,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
})

export const friendshipEventKafkaConsumer = kafka.consumer({
  groupId: env.kafkaConsumerGroupId,
})
