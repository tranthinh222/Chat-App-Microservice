import type { Request, Response } from 'express'
import type { RegisterDto } from '../dtos/register.dto.js'
import { authService } from '../config/container.js'
import type { LoginUserDto } from '../dtos/login-user.dto.js'
import type { RefreshTokenDto } from '../dtos/refresh-token.dto.js'

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

  async refresh(
    req: Request<object, object, RefreshTokenDto>,
    res: Response,
  ): Promise<void> {
    const result = await authService.refresh(req.body)

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    })
  }

  async logout(
    req: Request<object, object, RefreshTokenDto>,
    res: Response,
  ): Promise<void> {
    await authService.logout(req.body)

    res.status(204).send()
  }
}

export const authController = new AuthController()
