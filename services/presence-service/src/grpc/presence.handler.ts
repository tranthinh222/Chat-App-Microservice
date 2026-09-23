import grpc from "@grpc/grpc-js";

import type { PresenceGrpcHandlers, PresenceResponse } from "./grpc.types.js";

import { errorMessage, grpcError } from "../shared/error.js";
import { PresenceSnapshot } from "../type/presence.types.js";
import * as presenceService from "../application/presence.service.js";

function toGrpcPresence(presence: PresenceSnapshot): PresenceResponse {
	return {
		user_id: presence.userId,
		status: presence.status,
		last_seen_at: presence.lastSeenAt ?? 0,
		updated_at: presence.updatedAt,
	};
}

const presenceHandlers: PresenceGrpcHandlers = {
	async RegisterConnection(call, callback): Promise<void> {
		try {
			const request = call.request;
			const result = await presenceService.registerConnection({
				userId: request.user_id,
				connectionId: request.connection_id,
				gatewayId: request.gateway_id,
				deviceId: request.device_id,
			});

			callback(null, toGrpcPresence(result));
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},

	async Heartbeat(call, callback): Promise<void> {
		try {
			const request = call.request;
			const success = await presenceService.heartbeat({
				userId: request.user_id,
				connectionId: request.connection_id,
			});

			callback(null, {
				success,
			});
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},

	async TouchActivity(call, callback): Promise<void> {
		try {
			const request = call.request;
			const result = await presenceService.touchActivity({
				userId: request.user_id,
				connectionId: request.connection_id,
			});

			if (!result) {
				callback(
					grpcError(grpc.status.NOT_FOUND, "Connection not found"),
				);
				return;
			}

			callback(null, toGrpcPresence(result));
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},

	async Disconnect(call, callback): Promise<void> {
		try {
			const request = call.request;
			const result = await presenceService.disconnect({
				userId: request.user_id,
				connectionId: request.connection_id,
			});

			callback(null, toGrpcPresence(result));
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},

	async GetPresence(call, callback): Promise<void> {
		try {
			const request = call.request;
			const result = await presenceService.getPresence(request.user_id);

			callback(null, toGrpcPresence(result));
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},

	async BatchGetPresence(call, callback): Promise<void> {
		try {
			const request = call.request;
			const result = await presenceService.batchGetPresence(
				request.user_ids,
			);

			callback(null, {
				presences: result.map(toGrpcPresence),
			});
		} catch (error: unknown) {
			callback(grpcError(grpc.status.INTERNAL, errorMessage(error)));
		}
	},
};

export { presenceHandlers };
