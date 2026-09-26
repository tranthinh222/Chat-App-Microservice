import express from 'express'
import { prisma } from './config/prisma.js'
import { errorMiddleware } from './middlewares/error.middleware.js'

const app = express()

app.use(express.json())

app.get('/health/live', (_req, res) => {
  res.status(200).json({
    service: 'friendship-service',
    status: 'UP',
  })
})

app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      service: 'friendship-service',
      status: 'READY',
      dependencies: {
        database: 'UP',
      },
    })
  } catch {
    res.status(503).json({
      service: 'friendship-service',
      status: 'NOT_READY',
      dependencies: {
        database: 'DOWN',
      },
    })
  }
})

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    code: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found',
  })
})

app.use(errorMiddleware)

export default app
