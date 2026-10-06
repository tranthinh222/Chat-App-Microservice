import { z } from 'zod'

export const getUsersBatchValidator = z.object({
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user ID is required')
    .max(100, 'A maximum of 100 user IDs is allowed')
    .transform((userIds) => [...new Set(userIds)]),
})

export type GetUsersBatchDto = z.infer<typeof getUsersBatchValidator>
