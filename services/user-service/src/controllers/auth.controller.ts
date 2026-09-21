import type { Request, Response } from 'express'
import { Gender } from '../generated/prisma/client.js'
import { authService } from '../services/auth.service.js'

function isGender(value: unknown): value is Gender {
  return Object.values(Gender).some((gender) => gender === value)
}

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { phone, email, username, password, birthday, gender } = req.body

      if (
        typeof phone !== 'string' ||
        typeof email !== 'string' ||
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof birthday !== 'string' ||
        !isGender(gender) ||
        !phone.trim() ||
        !email.trim() ||
        !username.trim()
      ) {
        res.status(400).json({
          message:
            'phone, email, username, password, birthday and a valid gender are required',
        })
        return
      }

      if (password.length < 8) {
        res.status(400).json({
          message: 'Password must contain at least 8 characters',
        })
        return
      }

      const user = await authService.register({
        phone,
        email,
        username,
        password,
        birthday,
        gender,
      })

      res.status(201).json({
        message: 'User registered successfully',
        data: user,
      })
    } catch (error) {
      if (error instanceof Error) {
        const conflictMessages: Partial<Record<string, string>> = {
          PHONE_ALREADY_EXISTS: 'Phone already exists',
          EMAIL_ALREADY_EXISTS: 'Email already exists',
          USERNAME_ALREADY_EXISTS: 'Username already exists',
        }
        const conflictMessage = conflictMessages[error.message]

        if (conflictMessage) {
          res.status(409).json({ message: conflictMessage })
          return
        }

        if (error.message === 'INVALID_BIRTHDAY') {
          res.status(400).json({ message: 'Birthday is invalid' })
          return
        }
      }

      console.error(error)

      res.status(500).json({
        message: 'Internal server error',
      })
    }
  }
}

export const authController = new AuthController()
