import express from 'express'
import { prisma } from './config/prisma.js'

const app = express()

app.get('/health/live', (_request, response) => {
  response.status(200).json({
    service: 'notification-service',
    status: 'UP',
  })
})

app.get('/health/ready', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    response.status(200).json({
      service: 'notification-service',
      status: 'READY',
      dependencies: {
        database: 'UP',
      },
    })
  } catch {
    response.status(503).json({
      service: 'notification-service',
      status: 'NOT_READY',
      dependencies: {
        database: 'DOWN',
      },
    })
  }
})

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    code: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found',
  })
})

export default app
