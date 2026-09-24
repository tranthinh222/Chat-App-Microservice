import { z } from 'zod'
import { Gender } from '../generated/prisma/client.js'

export const registerUserValidator = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, 'Phone number is invalid'),

  email: z.string().trim().email('Email is invalid').toLowerCase(),

  username: z
    .string()
    .trim()
    .min(3, 'Username must contain at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(
      /^[\p{L}\p{N}_ ]+$/u,
      'Username can only contain letters, numbers, spaces and underscores',
    ),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),

  birthday: z.iso.date('Birthday must use the YYYY-MM-DD format'),

  gender: z.enum(Gender, {
    error: 'Gender must be MALE, FEMALE or OTHER',
  }),
})

export type RegisterDto = z.infer<typeof registerUserValidator>
