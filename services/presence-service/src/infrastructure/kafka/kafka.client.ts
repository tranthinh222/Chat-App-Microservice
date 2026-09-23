import { Kafka, Producer } from "kafkajs";
import { env } from "../../config/env.js";

const kafka = new Kafka({
	clientId: env.KAFKA_CLIEND_ID || "presence-service",
	brokers: env.KAFKA_BROKERS.split(",").map((broker: string) =>
		broker.trim(),
	),
});

const producer: Producer = kafka.producer({ allowAutoTopicCreation: false });

async function connectKafka(): Promise<void> {
	await producer.connect();

	console.log("Kafka producer connected");
}

async function disconnectKafka(): Promise<void> {
	await producer.disconnect();
}

export { producer, connectKafka, disconnectKafka };
