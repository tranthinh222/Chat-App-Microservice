import { z } from 'zod'

export const friendParamsValidator = z.object({
  friendId: z.coerce.number().int().positive(),
})
