import { z } from 'zod'
import { AppError } from '../errors/app-error.js'

const userServiceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number().int().positive(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    status: z.literal('ACTIVE'),
  }),
})

export type PublicUser = {
  id: number
  username: string
  avatarUrl: string | null
}

export interface UserServiceClient {
  findActiveUserById(userId: number, accessToken: string): Promise<PublicUser>
}

export class HttpUserServiceClient implements UserServiceClient {
  private readonly baseUrl: string

  constructor(
    baseUrl: string,
    private readonly timeoutMs: number,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async findActiveUserById(
    userId: number,
    accessToken: string,
  ): Promise<PublicUser> {
    let response: Response

    try {
      response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch {
      throw new AppError(
        503,
        'USER_SERVICE_UNAVAILABLE',
        'User service is temporarily unavailable',
      )
    }

    if (response.status === 401) {
      throw new AppError(
        401,
        'INVALID_ACCESS_TOKEN',
        'Access token is invalid or expired',
      )
    }

    if (response.status === 404) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    }

    if (!response.ok) {
      throw new AppError(
        503,
        'USER_SERVICE_UNAVAILABLE',
        'User service is temporarily unavailable',
      )
    }

    let body: unknown

    try {
      body = await response.json()
    } catch {
      throw new AppError(
        502,
        'INVALID_USER_SERVICE_RESPONSE',
        'User service returned an invalid response',
      )
    }

    const result = userServiceResponseSchema.safeParse(body)

    if (!result.success) {
      throw new AppError(
        502,
        'INVALID_USER_SERVICE_RESPONSE',
        'User service returned an invalid response',
      )
    }

    return {
      id: result.data.data.id,
      username: result.data.data.username,
      avatarUrl: result.data.data.avatarUrl,
    }
  }
}
