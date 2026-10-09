import { createServer } from 'node:http'
import app from './app.js'
import { createNotificationRuntime } from './config/container.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function startServer(): Promise<void> {
  await prisma.$connect()

  const server = createServer(app)
  const { friendshipEventConsumer, realtimeGateway } =
    createNotificationRuntime(server)

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(env.port, () => {
      server.off('error', reject)
      console.log(`Notification service running http://localhost:${env.port}`)
      resolve()
    })
  })

  await friendshipEventConsumer.start()
  let shuttingDown = false

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    console.log(`${signal} received. Shutting down notification service...`)

    await friendshipEventConsumer.stop()
    await realtimeGateway.close()
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
  console.error('Failed to shut down notification service cleanly', error)
  process.exitCode = 1
}

startServer().catch((error: unknown) => {
  console.error('Failed to start notification service', error)
  void prisma.$disconnect().finally(() => {
    process.exit(1)
  })
})
