import 'dotenv/config'
import app from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function startServer(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('Connected to PostgreSQL')
    app.listen(env.port, () => {
      console.log(`User service running http://localhost:${env.port}`)
    })
    console.log(`Server running on port ${env.port}`)
  } catch (error) {
    console.error('Failed to start User Service:', error)
    process.exit(1)
  }
}
startServer()
