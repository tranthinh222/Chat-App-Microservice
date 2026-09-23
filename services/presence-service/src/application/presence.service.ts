import * as repository from "../infrastructure/redis/presence.repository.js";

import { publishPresenceChanged } from "../infrastructure/kafka/presence.publisher.js";
import {
	ConnectionInput,
	PresenceResult,
	PresenceSnapshot,
	RegisterConnectionInput,
} from "../type/presence.types.js";

async function publishIfChanged(result: PresenceResult | null): Promise<void> {
	if (!result || !result.changed || !result.previousStatus) {
		return;
	}

	await publishPresenceChanged({
		userId: result.userId,
		previousStatus: result.previousStatus,
		status: result.status,
		lastSeenAt: result.lastSeenAt,
	});
}

async function registerConnection(
	input: RegisterConnectionInput,
): Promise<PresenceResult> {
	const result = await repository.registerConnection(input);

	await publishIfChanged(result);

	return result;
}

async function heartbeat(input: ConnectionInput): Promise<boolean> {
	return await repository.heartbeat(input);
}

async function touchActivity(
	input: ConnectionInput,
): Promise<PresenceResult | null> {
	const result = await repository.touchActivity(input);

	await publishIfChanged(result);

	return result;
}

async function disconnect(input: ConnectionInput): Promise<PresenceResult> {
	const result = await repository.disconnect(input);

	await publishIfChanged(result);

	return result;
}

async function markIdle(
	input: ConnectionInput,
): Promise<PresenceResult | null> {
	const result = await repository.markIdle(input);

	await publishIfChanged(result);

	return result;
}

async function getPresence(userId: string): Promise<PresenceSnapshot> {
	return await repository.getPresence(userId);
}

async function batchGetPresence(
	userIds: readonly string[],
): Promise<PresenceSnapshot[]> {
	return await repository.batchGetPresence(userIds);
}

export {
	registerConnection,
	heartbeat,
	touchActivity,
	disconnect,
	markIdle,
	getPresence,
	batchGetPresence,
};
