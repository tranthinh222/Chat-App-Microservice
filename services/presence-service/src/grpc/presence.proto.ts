import path from "node:path";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDefinition = protoLoader.loadSync(
	path.resolve("proto/presence.proto"),
	{
		keepCase: true,
		longs: Number,
		enums: String,
		defaults: true,
		oneofs: true,
	},
);

const loadedProto = grpc.loadPackageDefinition(packageDefinition);

export { loadedProto };
