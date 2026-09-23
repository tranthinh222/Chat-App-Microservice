import grpc from "@grpc/grpc-js";
import { env } from "../config/env.js";
import { loadedProto } from "./presence.proto.js";
import { presenceHandlers } from "./presence.handler.js";

interface PresenceProtoPackage {
	presence: {
		PresenceService: {
			service: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>;
		};
	};
}

async function startGrpcServer(): Promise<grpc.Server> {
	const proto = loadedProto as unknown as PresenceProtoPackage;

	const server = new grpc.Server();

	server.addService(proto.presence.PresenceService.service, presenceHandlers);

	const address = `0.0.0.0:${env.GRPC_PORT}`;

	await new Promise<void>((resolve, reject) => {
		server.bindAsync(
			address,
			grpc.ServerCredentials.createInsecure(),
			(error: Error | null, port: number) => {
				if (error) {
					reject(error);

					return;
				}

				console.log(`gRPC listening on ${address}`);

				console.log(`gRPC bound port ${port}`);

				resolve();
			},
		);
	});

	return server;
}

export { startGrpcServer };
