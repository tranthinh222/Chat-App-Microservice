import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.post('/register', authController.register.bind(authController))

export default authRouter
