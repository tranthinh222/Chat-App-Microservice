import { z } from 'zod'

export const loginUserValidator = z.object({
  email: z.string().trim().email('Email is invalid').toLowerCase(),

  password: z.string().min(1, 'Password is required'),
})

export type LoginUserDto = z.infer<typeof loginUserValidator>
