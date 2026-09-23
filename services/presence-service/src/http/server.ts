import type { Server } from "node:http";

import express, { Request, Response } from "express";

import { env } from "../config/env.js";

function startHttpServer(): Server {
	const app = express();

	app.use(express.json());

	app.get("/health", (_request: Request, response: Response): void => {
		response.status(200).json({
			service: "presence-service",
			status: "ok",
		});
	});

	app.get("/ready", (_request: Request, response: Response): void => {
		response.status(200).json({
			status: "ready",
		});
	});

	return app.listen(env.HTTP_PORT, (): void => {
		console.log(`HTTP listening on port: ${env.HTTP_PORT}`);
	});
}

export { startHttpServer };
