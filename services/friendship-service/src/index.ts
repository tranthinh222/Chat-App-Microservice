import app from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function startServer(): Promise<void> {
  await prisma.$connect()

  const server = app.listen(env.port, () => {
    console.log(`Friendship service running http://localhost:${env.port}`)
  })

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down friendship service...`)

    server.close(() => {
      void prisma.$disconnect().finally(() => {
        process.exit(0)
      })
    })
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

startServer().catch((error: unknown) => {
  console.error('Failed to start friendship service', error)
  void prisma.$disconnect().finally(() => {
    process.exit(1)
  })
})
