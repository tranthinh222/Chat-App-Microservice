import type { Request, Response } from 'express'
import { registerUserValidator } from '../dtos/register.dto.js'
import { authService } from '../services/auth.service.js'

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = registerUserValidator.safeParse(req.body)

      if (!result.success) {
        res.status(400).json({
          message: 'Validation failed',
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const user = await authService.register(result.data)

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
