import { z } from 'zod'
import { Gender } from '../generated/prisma/client.js'

export const updateProfileValidator = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must contain at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(
        /^[\p{L}\p{N}_ ]+$/u,
        'Username can only contain letters, numbers, spaces and underscores',
      )
      .optional(),

    birthday: z
      .iso
      .date('Birthday must use the YYYY-MM-DD format')
      .optional(),

    gender: z
      .enum(Gender, {
        error: 'Gender must be MALE, FEMALE or OTHER',
      })
      .optional(),

    avatarUrl: z.url('Avatar URL is invalid').nullable().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message: 'At least one field must be provided',
    },
  )

export type UpdateProfileDto = z.infer<typeof updateProfileValidator>
