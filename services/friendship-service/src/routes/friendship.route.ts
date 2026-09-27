import { Router } from 'express'
import { friendshipController } from '../controllers/friendship.controller.js'
import { createFriendRequestValidator } from '../dtos/create-friend-request.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

const friendshipRouter = Router()

friendshipRouter.post(
  '/requests',
  validateBody(createFriendRequestValidator),
  asyncHandler(friendshipController.createRequest.bind(friendshipController)),
)

export default friendshipRouter
