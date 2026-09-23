import { AppError } from '../errors/app-errors.js'
import type { UserRepository } from '../repositories/user.repository.js'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMyProfile(userId: number) {
    const user = await this.userRepository.findById(userId)

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

