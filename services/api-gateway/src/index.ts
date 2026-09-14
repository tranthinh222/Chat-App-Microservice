import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))

app.get('/health', (_request, response) => {
  response.json({
    service: 'api-gateway',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

const routes = [
  ['/api/auth', process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001'],
  ['/api/places', process.env.PLACE_SERVICE_URL ?? 'http://localhost:3002'],
  ['/api/reviews', process.env.REVIEW_SERVICE_URL ?? 'http://localhost:3003'],
] as const

for (const [route, target] of routes) {
  app.use(route, createProxyMiddleware({ target, changeOrigin: true }))
}

app.use((_request, response) => {
  response.status(404).json({ message: 'Resource not found' })
})

app.listen(port, () => console.log(`API Gateway: http://localhost:${port}`))
