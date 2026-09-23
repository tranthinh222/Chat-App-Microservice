import { Redis } from "ioredis";
import { env } from "../../config/env.js";

const redis = new Redis(env.REDIS_URL, {
	lazyConnect: true,
	enableReadyCheck: true,
	maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
	console.log("Redis connected");
});

redis.on("ready", () => {
	console.log("Redis ready");
});

redis.on("error", (err: Error) => {
	console.error("Redis error: ", err.message);
});

redis.on("reconnecting", () => {
	console.warn("Redis reconnecting");
});

redis.on("close", () => {
	console.warn("Redis connection closed");
});

async function connectRedis(): Promise<void> {
	if (redis.status === "wait") {
		await redis.connect();
	}

	await redis.ping();

	console.log("Redis ping successful");
}

async function disconnectRedis(): Promise<void> {
	if (redis.status !== "end" && redis.status !== "close") {
		await redis.quit();
	}
}

export { redis, connectRedis, disconnectRedis };
