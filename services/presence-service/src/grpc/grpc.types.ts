import type { Client, handleUnaryCall, UntypedHandleCall } from "@grpc/grpc-js";
import { PresenceStatus } from "../type/presence.types.js";

export interface RegisterConnectionRequest {
	user_id: string;
	connection_id: string;
	gateway_id: string;
	device_id: string;
}

export interface HeartbeatRequest {
	user_id: string;
	connection_id: string;
}

export interface TouchActivityRequest {
	user_id: string;
	connection_id: string;
}

export interface DisconnectRequest {
	user_id: string;
	connection_id: string;
}

export interface GetPresenceRequest {
	user_id: string;
}

export interface BatchGetPresenceRequest {
	user_ids: string[];
}

export interface PresenceResponse {
	user_id: string;
	status: PresenceStatus;
	last_seen_at: number;
	updated_at: number;
}

export interface HeartbeatResponse {
	success: boolean;
}

export interface BatchGetPresenceResponse {
	presences: PresenceResponse[];
}

export interface PresenceGrpcHandlers {
	[key: string]: UntypedHandleCall;
	RegisterConnection: handleUnaryCall<
		RegisterConnectionRequest,
		PresenceResponse
	>;

	Heartbeat: handleUnaryCall<HeartbeatRequest, HeartbeatResponse>;

	TouchActivity: handleUnaryCall<TouchActivityRequest, PresenceResponse>;

	Disconnect: handleUnaryCall<DisconnectRequest, PresenceResponse>;

	GetPresence: handleUnaryCall<GetPresenceRequest, PresenceResponse>;

	BatchGetPresence: handleUnaryCall<
		BatchGetPresenceRequest,
		BatchGetPresenceResponse
	>;
}

export interface PresenceGrpcClient extends Client {
	RegisterConnection(
		request: RegisterConnectionRequest,
		callback: (error: Error | null, response?: PresenceResponse) => void,
	): void;

	Heartbeat(
		request: HeartbeatRequest,
		callback: (error: Error | null, response?: HeartbeatResponse) => void,
	): void;

	Disconnect(
		request: DisconnectRequest,
		callback: (error: Error | null, response?: PresenceResponse) => void,
	): void;

	TouchActivity(
		request: TouchActivityRequest,
		callback: (error: Error | null, response?: PresenceResponse) => void,
	): void;
}
