import { z } from 'zod'

export const friendRequestParamsValidator = z.object({
  requestId: z.coerce
    .number()
    .int('Request ID must be an integer')
    .positive('Request ID must be positive'),
})

export type FriendRequestParamsDto = z.infer<
  typeof friendRequestParamsValidator
>
