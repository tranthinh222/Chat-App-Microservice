export enum PresenceStatus {
	ONLINE = "ONLINE",
	IDLE = "IDLE",
	OFFLINE = "OFFLINE",
}

export type RegisterConnectionInput = {
	userId: string;
	connectionId: string;
	gatewayId: string;
	deviceId: string;
};

export type ConnectionInput = {
	userId: string;
	connectionId: string;
};

export type PresenceConnection = {
	userId: string;
	connectionId: string;

	gatewayId: string;
	devicedId: string;
	state: PresenceStatus;
	lastHeartbeatAt: number;
	lastActivityAt: number;
};

export type PresenceSnapshot = {
	userId: string;
	status: PresenceStatus;
	lastSeenAt: number | null;
	updatedAt: number;
};

export type PresenceResult = PresenceSnapshot & {
	changed: boolean;
	previousStatus?: PresenceStatus;
};

export type PresenceChangedPayload = {
	userId: string;
	previousStatus: PresenceStatus;
	status: PresenceStatus;
	lastSeenAt: number | null;
};

export type PresenceConnectionRedisHash = {
	userId: string;
	connectionId: string;
	gatewayId: string;
	deviceId: string;
	state: string;
	lastHeartbeatAt: string;
	lastActivityAt: string;
};

export type PresenceSummaryRedisHash = {
	state: string;
	updatedAt: string;
	lastSeenAt?: string;
};

export type PresenceExpirationMember = {
	userId: string;
	connectionId: string;
};

export type EventEnvelope<TPayload> = {
	eventId: string;
	eventType: string;
	eventVersion: number;
	occuredAt: string;
	producer: string;
	payload: TPayload;
};

export function isPresenceStatus(value: unknown): value is PresenceStatus {
	return (
		value === PresenceStatus.ONLINE ||
		value === PresenceStatus.IDLE ||
		value === PresenceStatus.OFFLINE
	);
}

export function parsePresenceStatus(value: unknown): PresenceStatus | null {
	return isPresenceStatus(value) ? value : null;
}
