import type { Request, Response } from 'express'
import { AppError } from '../errors/app-errors.js'
import { userService } from '../config/container.js'
import type { UpdateProfileDto } from '../dtos/update-profile.dto.js'

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

  async updateMe(
    req: Request<object, object, UpdateProfileDto>,
    res: Response,
  ): Promise<void> {
    if (!req.auth) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    const profile = await userService.updateProfile(req.auth.userId, req.body)

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    })
  }
}

export const userController = new UserController()
