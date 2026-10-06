import type { Request, Response } from 'express'
import { AppError } from '../errors/app-errors.js'
import { userService } from '../config/container.js'
import type { SearchUserDto } from '../dtos/search-user.dto.js'
import type { UpdateProfileDto } from '../dtos/update-profile.dto.js'
import type { GetUsersBatchDto } from '../dtos/get-users-batch.dto.js'

class UserController {
  async getUsersBatch(
    req: Request<object, object, GetUsersBatchDto>,
    res: Response,
  ): Promise<void> {
    const users = await userService.findPublicUsersByIds(req.body.userIds)

    res.status(200).json({
      success: true,
      message: 'User profiles retrieved successfully',
      data: users,
    })
  }

  async searchUser(_req: Request, res: Response): Promise<void> {
    const { phone } = res.locals.validatedQuery as SearchUserDto
    const user = await userService.findPublicUserByPhone(phone)

    res.status(200).json({
      success: true,
      message: 'User found successfully',
      data: user,
    })
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const profile = await userService.getUserProfile(Number(req.params.userId))

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: profile,
    })
  }

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
