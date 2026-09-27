import { z } from 'zod'

export const createFriendRequestValidator = z
  .object({
    receiverId: z
      .number()
      .int('Receiver ID must be an integer')
      .positive('Receiver ID must be positive'),
  })
  .strict()

export type CreateFriendRequestDto = z.infer<
  typeof createFriendRequestValidator
>
