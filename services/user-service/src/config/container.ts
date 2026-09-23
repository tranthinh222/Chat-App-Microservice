import { userRepository } from '../repositories/prisma-user.repository.js'
import { refreshTokenRepository } from '../repositories/prisma-refresh-token.repository.js'
import { AuthService } from '../services/auth.service.js'
import { tokenService } from '../services/token.service.js'

export const authService = new AuthService(
  userRepository,
  refreshTokenRepository,
  tokenService,
)
