import type { Request, Response } from 'express'
import type { RegisterDto } from '../dtos/register.dto.js'
import { authService } from '../config/container.js'
import type { LoginUserDto } from '../dtos/login-user.dto.js'

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

  async login(
    req: Request<object, object, LoginUserDto>,
    res: Response,
  ): Promise<void> {
    const result = await authService.login(req.body)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    })
  }
}

export const authController = new AuthController()
