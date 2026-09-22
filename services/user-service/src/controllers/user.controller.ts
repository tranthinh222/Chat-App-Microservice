import type { Request, Response } from 'express'
import { AppError } from '../errors/app-errors.js'
import { userService } from '../services/user.service.js'

class UserController {
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    const profile = await userService.getMyProfile(req.auth.userId)

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    })
  }
}

export const userController = new UserController()
