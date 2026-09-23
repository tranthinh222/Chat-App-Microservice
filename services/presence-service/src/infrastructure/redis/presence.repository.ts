import { env } from "../../config/env.js";
import {
	ConnectionInput,
	parsePresenceStatus,
	PresenceConnectionRedisHash,
	PresenceResult,
	PresenceSnapshot,
	PresenceStatus,
	RegisterConnectionInput,
} from "../../type/presence.types.js";
import { redis } from "./redis.client.js";

const HEARTBEAT_TIMEOUT_MS = env.HEARTBEAT_TIMEOUT_MS;

const IDLE_TIMEOUT_MS = env.IDLE_TIMEOUT_MS;

export const EXPIRATION_ZSET_KEY = "presence:expirations";
export const IDLE_ZSET_KEY = "presence:idle-deadlines";

const summaryKey = (userId: string): string => `presence:{${userId}}:summary`;

const connectionsKey = (userId: string): string =>
	`presence:{${userId}}:connections`;

const connectionKey = (userId: string, connectionId: string): string =>
	`presence:{${userId}}:conn:${connectionId}`;

const expirationMemberKey = (userId: string, connectionId: string): string =>
	`${userId}|${connectionId}`;

async function registerConnection(input: RegisterConnectionInput) {
	const { userId, connectionId, gatewayId, deviceId } = input;

	const now = Date.now();
	const key = connectionKey(userId, connectionId);

	const pipeline = redis.pipeline();

	pipeline.hset(key, {
		userId,
		connectionId,
		gatewayId,
		deviceId,
		state: PresenceStatus.ONLINE,
		lastHeartbeatAt: now.toString(),
		lastActivityAt: now.toString(),
	});

	pipeline.expire(key, Math.ceil(HEARTBEAT_TIMEOUT_MS / 1000) + 30);

	pipeline.sadd(connectionsKey(userId), connectionId);

	pipeline.zadd(
		EXPIRATION_ZSET_KEY,
		now + HEARTBEAT_TIMEOUT_MS,
		expirationMemberKey(userId, connectionId),
	);

	pipeline.zadd(
		IDLE_ZSET_KEY,
		now + IDLE_TIMEOUT_MS,
		expirationMemberKey(userId, connectionId),
	);

	await pipeline.exec();

	return recomputeUserPresence(userId);
}

async function heartbeat(input: ConnectionInput): Promise<boolean> {
	const { userId, connectionId } = input;

	const key = connectionKey(userId, connectionId);

	const exists = await redis.exists(key);
	if (exists === 0) {
		return false;
	}

	const now = Date.now();

	const pipeline = redis.pipeline();

	pipeline.hset(key, "lastHeartbeatAt", now);

	pipeline.expire(key, Math.ceil(HEARTBEAT_TIMEOUT_MS / 1000) + 30);

	pipeline.zadd(
		EXPIRATION_ZSET_KEY,
		now + HEARTBEAT_TIMEOUT_MS,
		expirationMemberKey(userId, connectionId),
	);

	await pipeline.exec();

	return true;
}

async function getConnection(
	userId: string,
	connectionId: string,
): Promise<PresenceConnectionRedisHash | null> {
	const result = await redis.hgetall(connectionKey(userId, connectionId));

	if (Object.keys(result).length === 0) {
		return null;
	}

	return {
		userId: result.userId ?? "",
		connectionId: result.connectionId ?? "",
		gatewayId: result.gatewwayId ?? "",
		deviceId: result.deviceId ?? "",
		state: result.state ?? "",
		lastHeartbeatAt: result.lastHeartbeatAt ?? "0",
		lastActivityAt: result.lastHeartbeatAt ?? "0",
	};
}

async function touchActivity(
	input: ConnectionInput,
): Promise<PresenceResult | null> {
	const { userId, connectionId } = input;

	const connection = await getConnection(userId, connectionId);

	if (!connection) {
		return null;
	}

	const previousState = parsePresenceStatus(connection.state);

	if (!previousState) {
		throw new Error(`Invalid presence state: ${connection.state}`);
	}

	const key = connectionKey(userId, connectionId);
	const now = Date.now();

	const pipeline = redis.pipeline();

	pipeline.hset(key, {
		state: PresenceStatus.ONLINE,
		lastActivity: now.toString(),
	});

	pipeline.zadd(
		IDLE_ZSET_KEY,
		now + IDLE_TIMEOUT_MS,
		expirationMemberKey(userId, connectionId),
	);

	await pipeline.exec();

	if (previousState === PresenceStatus.IDLE) {
		return recomputeUserPresence(userId);
	}

	return getPresenceResult(userId);
}

async function disconnect(input: ConnectionInput) {
	const { userId, connectionId } = input;

	const member = expirationMemberKey(userId, connectionId);

	const pipeline = redis.pipeline();

	pipeline.del(connectionKey(userId, connectionId));

	pipeline.srem(connectionsKey(userId), connectionId);

	pipeline.zrem(EXPIRATION_ZSET_KEY, member);

	pipeline.zrem(IDLE_ZSET_KEY, member);

	await pipeline.exec();

	return recomputeUserPresence(userId);
}

async function recomputeUserPresence(userId: string): Promise<PresenceResult> {
	const connectionIds = await redis.smembers(connectionsKey(userId));

	if (!connectionIds.length) {
		return updateSummary(userId, PresenceStatus.OFFLINE);
	}

	const pipeline = redis.pipeline();

	for (const connectionId of connectionIds) {
		pipeline.hget(connectionKey(userId, connectionId), "state");
	}

	const results = await pipeline.exec();

	if (!results) {
		throw new Error("Redis pipeline returned null");
	}

	const states: PresenceStatus[] = [];

	const staleConnections: string[] = [];

	results.forEach(([error, value], index) => {
		const connectionId = connectionIds[index];

		if (!connectionId) {
			return;
		}

		if (error || typeof value !== "string") {
			staleConnections.push(connectionId);

			return;
		}

		const parsed = parsePresenceStatus(value);

		if (!parsed) {
			staleConnections.push(connectionId);

			return;
		}

		states.push(parsed);
	});

	if (staleConnections.length > 0) {
		await redis.srem(connectionsKey(userId), ...staleConnections);
	}

	let nextStatus = PresenceStatus.OFFLINE;

	if (states.includes(PresenceStatus.ONLINE)) {
		nextStatus = PresenceStatus.ONLINE;
	} else if (states.includes(PresenceStatus.IDLE)) {
		nextStatus = PresenceStatus.IDLE;
	}

	return updateSummary(userId, nextStatus);
}

async function updateSummary(
	userId: string,
	nextStatus: PresenceStatus,
): Promise<PresenceResult> {
	const key = summaryKey(userId);

	const previousRaw = await redis.hget(key, "state");

	const previousStatus =
		parsePresenceStatus(previousRaw) ?? PresenceStatus.OFFLINE;

	if (previousRaw === null && nextStatus === PresenceStatus.OFFLINE) {
		return {
			userId,
			status: PresenceStatus.OFFLINE,
			lastSeenAt: null,
			updatedAt: 0,
			changed: false,
		};
	}

	if (previousStatus === nextStatus) {
		return getPresenceResult(userId);
	}

	const now = Date.now();

	const update: Record<string, string> = {
		state: nextStatus,
		updatedAt: now.toString(),
	};

	if (nextStatus === PresenceStatus.OFFLINE) {
		update.lastSeenAt = now.toString();
	}

	await redis.hset(key, update);

	const snapshot = await getPresence(userId);

	return {
		...snapshot,
		changed: true,
		previousStatus,
	};
}

async function getPresence(userId: string): Promise<PresenceSnapshot> {
	const data = await redis.hgetall(summaryKey(userId));

	const status = parsePresenceStatus(data.state);

	if (!status) {
		return {
			userId,
			status: PresenceStatus.OFFLINE,
			lastSeenAt: null,
			updatedAt: 0,
		};
	}

	return {
		userId,
		status,
		lastSeenAt: data.lastSeenAt ? Number(data.lastSeenAt || 0) : null,
		updatedAt: Number(data.updatedAt ?? 0),
	};
}

async function getPresenceResult(userId: string): Promise<PresenceResult> {
	const snapshot = await getPresence(userId);
	return { ...snapshot, changed: false };
}

async function batchGetPresence(
	userIds: readonly string[],
): Promise<PresenceSnapshot[]> {
	if (userIds.length === 0) {
		return [];
	}

	const pipeline = redis.pipeline();

	for (const userId of userIds) {
		pipeline.hgetall(summaryKey(userId));
	}

	const results = await pipeline.exec();

	if (!results) {
		throw new Error("Redis pipeline returned null");
	}

	return results.map(([error, rawValue], index): PresenceSnapshot => {
		const userId = userIds[index];

		if (!userId) {
			throw new Error("Presence pipeline index mismatch");
		}

		if (error || typeof rawValue !== "object" || rawValue === null) {
			return {
				userId,
				status: PresenceStatus.OFFLINE,
				lastSeenAt: null,
				updatedAt: 0,
			};
		}

		const data = rawValue as Record<string, string>;

		const status =
			parsePresenceStatus(data.state) ?? PresenceStatus.OFFLINE;

		return {
			userId,
			status,
			lastSeenAt: data.lastSeenAt ? Number(data.lastSeenAt) : null,
			updatedAt: Number(data.updatedAt ?? 0),
		};
	});
}

async function markIdle(
	input: ConnectionInput,
): Promise<PresenceResult | null> {
	const { userId, connectionId } = input;

	const connection = await getConnection(userId, connectionId);

	if (!connection) {
		return null;
	}

	const state = parsePresenceStatus(connection.state);

	if (!state) {
		throw new Error("Invalid connection presence state");
	}

	if (state === PresenceStatus.IDLE) {
		return getPresenceResult(userId);
	}

	const lastActivityAt = Number(connection.lastActivityAt);

	const now = Date.now();

	if (now - lastActivityAt < IDLE_TIMEOUT_MS) {
		return null;
	}

	await redis.hset(
		connectionKey(userId, connectionId),
		"state",
		PresenceStatus.IDLE,
	);

	return recomputeUserPresence(userId);
}

export {
	registerConnection,
	heartbeat,
	getConnection,
	touchActivity,
	disconnect,
	recomputeUserPresence,
	updateSummary,
	getPresence,
	getPresenceResult,
	batchGetPresence,
	markIdle,
};
