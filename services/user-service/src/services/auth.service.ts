import type { Gender } from '../generated/prisma/client.js'
import { userRepository } from '../repositories/prisma-user.repository.js'
import { hashPassword } from '../utils/password.js'

export type RegisterInput = {
  phone: string
  email: string
  username: string
  password: string
  birthday: string | Date
  gender: Gender
}

class AuthService {
  async register(input: RegisterInput) {
    const phone = input.phone.trim()
    const email = input.email.trim().toLowerCase()
    const username = input.username.trim().toLowerCase()
    const birthday =
      input.birthday instanceof Date ? input.birthday : new Date(input.birthday)

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

    const password = await hashPassword(input.password)

    const user = await userRepository.create({
      phone,
      email,
      username,
      password,
      birthday,
      gender: input.gender,
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
