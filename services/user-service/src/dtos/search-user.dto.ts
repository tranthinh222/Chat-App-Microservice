import { z } from 'zod'

export const searchUserValidator = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, 'Phone number is invalid'),
})

export type SearchUserDto = z.infer<typeof searchUserValidator>
