import { AppError } from '../errors/app-errors.js'
import type { UserRepository } from '../repositories/user.repository.js'
import type { UpdateProfileDto } from '../dtos/update-profile.dto.js'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findById(userId)

    if (!user || user.status !== 'ACTIVE' || user.isBanned) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    }

    return {
      id: user.id,
      username: user.username,
      birthday: user.birthday,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    }
  }

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

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    }

    const { birthday, ...profileData } = dto
    const updatedUser = await this.userRepository.updateById(userId, {
      ...profileData,
      ...(birthday ? { birthday: new Date(birthday) } : {}),
    })

    return {
      id: updatedUser.id,
      phone: updatedUser.phone,
      email: updatedUser.email,
      username: updatedUser.username,
      birthday: updatedUser.birthday,
      gender: updatedUser.gender,
      avatarUrl: updatedUser.avatarUrl,
      status: updatedUser.status,
      role: updatedUser.role,
      isBanned: updatedUser.isBanned,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }
  }
}

