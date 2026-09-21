import type { RegisterDto } from '../dtos/register.dto.js'
import { userRepository } from '../repositories/prisma-user.repository.js'
import { hashPassword } from '../utils/password.js'

class AuthService {
  async register(input: RegisterDto) {
    const { phone, email, username, password, gender } = input
    const birthday = new Date(input.birthday)

    if (Number.isNaN(birthday.getTime())) {
      throw new Error('INVALID_BIRTHDAY')
    }

    const userWithPhone = await userRepository.findByPhone(phone)

    if (userWithPhone) {
      throw new Error('PHONE_ALREADY_EXISTS')
    }

    const userWithEmail = await userRepository.findByEmail(email)

    if (userWithEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const userWithUsername = await userRepository.findByUsername(username)

    if (userWithUsername) {
      throw new Error('USERNAME_ALREADY_EXISTS')
    }

    const passwordHash = await hashPassword(password)

    const user = await userRepository.create({
      phone,
      email,
      username,
      password: passwordHash,
      birthday,
      gender,
    })

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      username: user.username,
      birthday: user.birthday,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
    }
  }
}

export const authService = new AuthService()
