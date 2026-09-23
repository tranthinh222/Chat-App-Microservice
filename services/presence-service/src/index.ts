import "dotenv/config";

import type { Server as HttpServer } from "node:http";

import type grpc from "@grpc/grpc-js";

import {
	connectRedis,
	disconnectRedis,
} from "./infrastructure/redis/redis.client.js";

import {
	connectKafka,
	disconnectKafka,
} from "./infrastructure/kafka/kafka.client.js";

import { startHttpServer } from "./http/server.js";

import { startPresenceSweeper } from "./workers/presence.sweeper.js";
import { startGrpcServer } from "./grpc/grpc.server.js";

let httpServer: HttpServer | null = null;

let grpcServer: grpc.Server | null = null;

let sweeper: NodeJS.Timeout | null = null;

async function bootstrap(): Promise<void> {
	await connectRedis();

	await connectKafka();

	grpcServer = await startGrpcServer();

	httpServer = await startHttpServer();

	sweeper = await startPresenceSweeper();

	console.log("Presence service started");
}

async function shutdown(): Promise<void> {
	console.log("Presence shutting down");

	if (sweeper) {
		clearInterval(sweeper);
	}

	if (httpServer) {
		await new Promise<void>((resolve, reject) => {
			httpServer!.close((error?: Error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	if (grpcServer) {
		await new Promise<void>((resolve) => {
			grpcServer!.tryShutdown((): void => resolve());
		});
	}

	await disconnectKafka();
	await disconnectRedis();

	console.log("Presence shutdown complete");
}

process.on("SIGINT", (): void => {
	void shutdown().finally((): void => process.exit(0));
});

process.on("SIGTERM", (): void => {
	void shutdown().finally((): void => process.exit(0));
});

bootstrap().catch((error: unknown): void => {
	console.error("Presence startup failed", error);

	process.exit(0);
});
