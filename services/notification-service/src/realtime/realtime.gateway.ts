import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import type { Notification } from '../generated/prisma/client.js'
import type { TokenService } from '../services/token.service.js'

type ServerToClientEvents = {
  'notification:new': (notification: RealtimeNotification) => void
}

type SocketData = {
  userId: number
}

export type RealtimeNotification = {
  id: string
  eventId: string
  type: string
  payload: unknown
  createdAt: string
}

export class RealtimeGateway {
  private readonly io: Server<
    Record<string, never>,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >

  constructor(
    server: HttpServer,
    tokenService: TokenService,
    allowedOrigin: string,
  ) {
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST'],
      },
    })

    this.io.use((socket, next) => {
      try {
        const token = this.getAccessToken(socket.handshake.auth.token, socket.handshake.headers.authorization)
        const accessToken = tokenService.verifyAccessToken(token)
        socket.data.userId = accessToken.userId
        next()
      } catch {
        next(new Error('Unauthorized'))
      }
    })

    this.io.on('connection', (socket) => {
      void socket.join(this.getUserRoom(socket.data.userId))
    })
  }

  emitNotification(recipientId: number, notification: Notification): boolean {
    const room = this.getUserRoom(recipientId)

    if (!this.io.sockets.adapter.rooms.has(room)) {
      return false
    }

    this.io.to(room).emit('notification:new', {
      id: notification.id,
      eventId: notification.eventId,
      type: notification.type,
      payload: notification.payload,
      createdAt: notification.createdAt.toISOString(),
    })

    return true
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => resolve())
    })
  }

  private getAccessToken(
    authToken: unknown,
    authorization: string | undefined,
  ): string {
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim().replace(/^Bearer\s+/i, '')
    }

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice(7).trim()

      if (token) {
        return token
      }
    }

    throw new Error('Access token is required')
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`
  }
}
