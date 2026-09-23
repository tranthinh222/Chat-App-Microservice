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

const authServiceUrl =
  process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001'

function authPath(path: string): string {
  return '/api/v1/auth' + path
}

function userPath(path: string): string {
  return '/api/v1/users' + path
}

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: authPath,
  }),
)

app.use(
  '/api/users',
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: userPath,
  }),
)

app.use((_request, response) => {
  response.status(404).json({ message: 'Resource not found' })
})

app.listen(port, () => console.log(`API Gateway: http://localhost:${port}`))
