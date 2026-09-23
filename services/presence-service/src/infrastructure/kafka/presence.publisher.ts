import crypto from "node:crypto";
import { producer } from "./kafka.client.js";
import {
	EventEnvelope,
	PresenceChangedPayload,
} from "../../type/presence.types.js";

const PRESENCE_TOPIC = "presence.user.changed";

async function publishPresenceChanged(
	payload: PresenceChangedPayload,
): Promise<void> {
	const event: EventEnvelope<PresenceChangedPayload> = {
		eventId: crypto.randomUUID(),

		eventType: "presence.user.changed",

		eventVersion: 1,

		occuredAt: new Date().toISOString(),

		producer: "presence-service",

		payload,
	};

	await producer.send({
		topic: PRESENCE_TOPIC,
		messages: [
			{
				key: payload.userId,
				value: JSON.stringify(event),
			},
		],
	});
}

export { publishPresenceChanged };
