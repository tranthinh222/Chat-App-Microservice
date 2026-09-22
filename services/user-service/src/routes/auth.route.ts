import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { registerUserValidator } from '../dtos/register.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

const authRouter = Router()

authRouter.post(
  '/register',
  validateBody(registerUserValidator),
  asyncHandler(authController.register.bind(authController)),
)

export default authRouter
