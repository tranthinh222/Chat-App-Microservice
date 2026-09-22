import { AppError } from '../errors/app-errors.js'
import { userRepository } from '../repositories/prisma-user.repository.js'

class UserService {
  async getMyProfile(userId: number) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

export const userService = new UserService()
