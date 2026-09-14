# VietTaste Map

A microservice monorepo containing a React + TypeScript application, an API Gateway, and independent Express services.

## Requirements

- Node.js 24
- npm 10+
- Docker (optional)

## Local development

```bash
nvm use
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`, and the API Gateway runs at `http://localhost:3000`.

## Verification

```bash
npm run typecheck
npm run build
```

## Run the backend with Docker

```bash
docker compose up --build
```

Example routes available through the Gateway:

- `GET /health`
- `GET /api/places`
- `GET /api/reviews`
- `POST /api/auth/login`
# viettaste-map
# Chat-App-Microservice
