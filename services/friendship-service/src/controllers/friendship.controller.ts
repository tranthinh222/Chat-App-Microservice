import type { Request, Response } from 'express'
import { friendshipService } from '../config/container.js'
import type { CreateFriendRequestDto } from '../dtos/create-friend-request.dto.js'
import { AppError } from '../errors/app-error.js'

class FriendshipController {
  async getIncomingRequests(req: Request, res: Response): Promise<void> {
    const requests = await friendshipService.getIncomingRequests(
      this.getAuthenticatedUserId(req),
      this.getAccessToken(req),
    )

    res.status(200).json({ success: true, data: requests })
  }

  async getOutgoingRequests(req: Request, res: Response): Promise<void> {
    const requests = await friendshipService.getOutgoingRequests(
      this.getAuthenticatedUserId(req),
      this.getAccessToken(req),
    )

    res.status(200).json({ success: true, data: requests })
  }

  async getFriends(req: Request, res: Response): Promise<void> {
    const friends = await friendshipService.getFriends(
      this.getAuthenticatedUserId(req),
      this.getAccessToken(req),
    )

    res.status(200).json({ success: true, data: friends })
  }

  async removeFriend(req: Request, res: Response): Promise<void> {
    await friendshipService.removeFriend(
      this.getAuthenticatedUserId(req),
      Number(req.params.friendId),
    )

    res.status(204).send()
  }

  async createRequest(
    req: Request<object, object, CreateFriendRequestDto>,
    res: Response,
  ): Promise<void> {
    const userId = this.getAuthenticatedUserId(req)

    if (!req.accessToken) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    const friendship = await friendshipService.sendFriendRequest(
      userId,
      req.body.receiverId,
      req.accessToken,
    )

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendship,
    })
  }

  async acceptRequest(req: Request, res: Response): Promise<void> {
    const friendship = await friendshipService.acceptFriendRequest(
      Number(req.params.requestId),
      this.getAuthenticatedUserId(req),
    )

    res.status(200).json({
      success: true,
      message: 'Friend request accepted successfully',
      data: friendship,
    })
  }

  async rejectRequest(req: Request, res: Response): Promise<void> {
    await friendshipService.rejectFriendRequest(
      Number(req.params.requestId),
      this.getAuthenticatedUserId(req),
    )

    res.status(204).send()
  }

  async cancelRequest(req: Request, res: Response): Promise<void> {
    await friendshipService.cancelFriendRequest(
      Number(req.params.requestId),
      this.getAuthenticatedUserId(req),
    )

    res.status(204).send()
  }

  private getAuthenticatedUserId(req: { auth?: { userId: number } }): number {
    if (!req.auth) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    return req.auth.userId
  }

  private getAccessToken(req: { accessToken?: string }): string {
    if (!req.accessToken) {
      throw new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      )
    }

    return req.accessToken
  }
}

export const friendshipController = new FriendshipController()
