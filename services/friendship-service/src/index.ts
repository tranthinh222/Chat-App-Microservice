import app from './app.js'
import { outboxPublisher } from './config/container.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function startServer(): Promise<void> {
  await prisma.$connect()

  const server = app.listen(env.port, () => {
    console.log(`Friendship service running http://localhost:${env.port}`)
  })
  outboxPublisher.start()

  let shuttingDown = false

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    console.log(`${signal} received. Shutting down friendship service...`)

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
    await outboxPublisher.stop()
    await prisma.$disconnect()
  }

  process.once('SIGINT', () => {
    void shutdown('SIGINT').catch(handleShutdownError)
  })
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM').catch(handleShutdownError)
  })
}

function handleShutdownError(error: unknown): void {
  console.error('Failed to shut down friendship service cleanly', error)
  process.exitCode = 1
}

startServer().catch((error: unknown) => {
  console.error('Failed to start friendship service', error)
  void prisma.$disconnect().finally(() => {
    process.exit(1)
  })
})
