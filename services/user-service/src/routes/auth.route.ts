import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { registerUserValidator } from '../dtos/register.dto.js'
import { validateBody } from '../middlewares/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { loginUserValidator } from '../dtos/login-user.dto.js'
import { refreshTokenValidator } from '../dtos/refresh-token.dto.js'

const authRouter = Router()

authRouter.post(
  '/register',
  validateBody(registerUserValidator),
  asyncHandler(authController.register.bind(authController)),
)

authRouter.post(
  '/login',
  validateBody(loginUserValidator),
  asyncHandler(authController.login.bind(authController)),
)

authRouter.post(
  '/refresh',
  validateBody(refreshTokenValidator),
  asyncHandler(authController.refresh.bind(authController)),
)

authRouter.post(
  '/logout',
  validateBody(refreshTokenValidator),
  asyncHandler(authController.logout.bind(authController)),
)

export default authRouter
