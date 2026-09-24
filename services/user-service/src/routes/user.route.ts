import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { updateProfileValidator } from '../dtos/update-profile.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'

const userRouter = Router()

userRouter.get(
  '/me',
  authenticate,
  asyncHandler(userController.getMe.bind(userController)),
)

userRouter.patch(
  '/me',
  authenticate,
  validateBody(updateProfileValidator),
  asyncHandler(userController.updateMe.bind(userController)),
)

export default userRouter
