import type { Request, Response } from 'express'
import { friendshipService } from '../config/container.js'
import type { CreateFriendRequestDto } from '../dtos/create-friend-request.dto.js'
import { AppError } from '../errors/app-error.js'

class FriendshipController {
  async createRequest(
    req: Request<object, object, CreateFriendRequestDto>,
    res: Response,
  ): Promise<void> {
    if (!req.auth || !req.accessToken) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    const friendship = await friendshipService.sendFriendRequest(
      req.auth.userId,
      req.body.receiverId,
      req.accessToken,
    )

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendship,
    })
  }
}

export const friendshipController = new FriendshipController()
