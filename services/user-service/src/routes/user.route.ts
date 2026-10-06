import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { updateProfileValidator } from '../dtos/update-profile.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'
import { getUserValidator } from '../dtos/get-user.dto.js'
import { validateParams } from '../middlewares/validate-params.js'
import { searchUserValidator } from '../dtos/search-user.dto.js'
import { validateQuery } from '../middlewares/validate-query.js'
import { getUsersBatchValidator } from '../dtos/get-users-batch.dto.js'

const userRouter = Router()

userRouter.get(
  '/search',
  authenticate,
  validateQuery(searchUserValidator),
  asyncHandler(userController.searchUser.bind(userController)),
)

userRouter.get(
  '/me',
  authenticate,
  asyncHandler(userController.getMe.bind(userController)),
)

userRouter.post(
  '/batch',
  authenticate,
  validateBody(getUsersBatchValidator),
  asyncHandler(userController.getUsersBatch.bind(userController)),
)

userRouter.patch(
  '/me',
  authenticate,
  validateBody(updateProfileValidator),
  asyncHandler(userController.updateMe.bind(userController)),
)

userRouter.get(
  '/:userId',
  authenticate,
  validateParams(getUserValidator),
  asyncHandler(userController.getUser.bind(userController)),
)

export default userRouter
