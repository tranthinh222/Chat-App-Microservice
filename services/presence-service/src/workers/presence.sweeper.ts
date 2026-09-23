import { PresenceExpirationMember } from "../type/presence.types.js";

import { redis } from "../infrastructure/redis/redis.client.js";

import {
	EXPIRATION_ZSET_KEY,
	IDLE_ZSET_KEY,
} from "../infrastructure/redis/presence.repository.js";

import * as presenceService from "../application/presence.service.js";

function parseMemmber(value: string): PresenceExpirationMember | null {
	const seperatorIndex = value.indexOf("|");

	if (seperatorIndex <= 0 || seperatorIndex === value.length - 1) {
		return null;
	}

	return {
		userId: value.slice(0, seperatorIndex),
		connectionId: value.slice(seperatorIndex + 1),
	};
}

async function sweepExpired(): Promise<void> {
	const now = Date.now();
	const members = await redis.zrangebyscore(
		EXPIRATION_ZSET_KEY,
		0,
		now,
		"LIMIT",
		0,
		100,
	);

	for (const member of members) {
		const claimed = await redis.zrem(EXPIRATION_ZSET_KEY, member);

		if (claimed === 0) {
			continue;
		}

		const parsed = parseMemmber(member);

		if (!parsed) {
			continue;
		}

		await presenceService.disconnect(parsed);
	}
}

async function sweepIdle(): Promise<void> {
	const now = Date.now();

	const members = await redis.zrangebyscore(
		IDLE_ZSET_KEY,
		0,
		now,
		"LIMIT",
		0,
		100,
	);

	for (const member of members) {
		const claimed = await redis.zrem(IDLE_ZSET_KEY, member);

		if (claimed === 0) {
			continue;
		}

		const parsed = parseMemmber(member);

		if (!parsed) {
			continue;
		}

		await presenceService.markIdle(parsed);
	}
}

function startPresenceSweeper(): NodeJS.Timeout {
	return setInterval((): void => {
		void (async (): Promise<void> => {
			try {
				await sweepExpired();

				await sweepIdle();
			} catch (error: unknown) {
				console.error("Presence Sweeper", error);
			}
		})();
	});
}

export { startPresenceSweeper };
