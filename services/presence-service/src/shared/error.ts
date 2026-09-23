import grpc from "@grpc/grpc-js";

function errorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return "Unknown error";
}

function grpcError(code: grpc.status, details: string): grpc.ServiceError {
	const error = new Error(details) as grpc.ServiceError;

	error.code = code;
	error.details = details;

	return error;
}

export { errorMessage, grpcError };
