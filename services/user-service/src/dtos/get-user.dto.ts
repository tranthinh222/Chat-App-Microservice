import { z } from 'zod'

export const getUserValidator = z.object({
  userId: z
    .string()
    .trim()
    .regex(/^\d+$/, 'User ID must be a positive integer')
    .transform(Number)
    .refine((userId) => userId > 0, 'User ID must be a positive integer'),
})

export type GetUserDto = z.infer<typeof getUserValidator>
