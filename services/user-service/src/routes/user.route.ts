import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

const userRouter = Router()

userRouter.get(
  '/me',
  authenticate,
  asyncHandler(userController.getMe.bind(userController)),
)

export default userRouter
