import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),

	HTTP_PORT: z.coerce.number().int().positive().default(3006),

	GRPC_PORT: z.coerce.number().int().positive().default(50054),

	REDIS_URL: z.string().default("localhost:6379"),

	KAFKA_BROKERS: z.string().default("localhost:9092"),

	KAFKA_CLIEND_ID: z.string().default("presence-servicce"),

	HEARTBEAT_TIMEOUT_MS: z.coerce.number().positive().default(60_0000),

	IDLE_TIMEOUT_MS: z.coerce.number().positive().default(300_0000),

	SWEEP_INTERVAL_MS: z.coerce.number().positive().default(5_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error(
		"Invalid environment variables: ",
		z.treeifyError(parsed.error),
	);

	throw new Error("Environment validation failed");
}

export const env = parsed.data;

export type Env = typeof env;
