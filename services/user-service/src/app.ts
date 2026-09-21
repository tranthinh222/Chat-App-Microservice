import express from 'express'
import { prisma } from './config/prisma.js'
import authRoute from './routes/auth.route.js'
const app = express()
app.use(express.json())

app.get('/health/live', (req, res) => {
  res.status(200).json({
    service: 'user-service',
    status: 'UP',
  })
})

app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      service: 'user-service',
      status: 'READY',
      database: 'UP',
    })
  } catch {
    res.status(503).json({
      service: 'user-service',
      status: 'READY',
      database: 'DOWN',
    })
  }
})

app.use('/api/v1/auth', authRoute)
export default app
