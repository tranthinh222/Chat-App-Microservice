import type { Request, Response } from 'express'
import type { RegisterDto } from '../dtos/register.dto.js'
import { authService } from '../services/auth.service.js'

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const input = req.body as RegisterDto
    const user = await authService.register(input)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    })
  }
}

export const authController = new AuthController()
