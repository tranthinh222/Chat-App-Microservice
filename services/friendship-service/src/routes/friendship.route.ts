import { Router } from 'express'
import { friendshipController } from '../controllers/friendship.controller.js'
import { createFriendRequestValidator } from '../dtos/create-friend-request.dto.js'
import { friendRequestParamsValidator } from '../dtos/friend-request-params.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'
import { validateParams } from '../middlewares/validate-params.js'
import { asyncHandler } from '../utils/async-handler.js'

const friendshipRouter = Router()

friendshipRouter.post(
  '/requests',
  validateBody(createFriendRequestValidator),
  asyncHandler(friendshipController.createRequest.bind(friendshipController)),
)

friendshipRouter.patch(
  '/requests/:requestId/accept',
  validateParams(friendRequestParamsValidator),
  asyncHandler(friendshipController.acceptRequest.bind(friendshipController)),
)

friendshipRouter.patch(
  '/requests/:requestId/reject',
  validateParams(friendRequestParamsValidator),
  asyncHandler(friendshipController.rejectRequest.bind(friendshipController)),
)

friendshipRouter.delete(
  '/requests/:requestId',
  validateParams(friendRequestParamsValidator),
  asyncHandler(friendshipController.cancelRequest.bind(friendshipController)),
)

export default friendshipRouter
