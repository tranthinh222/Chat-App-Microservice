import type { RegisterDto } from '../dtos/register.dto.js'
import type { LoginUserDto } from '../dtos/login-user.dto.js'
import { userRepository } from '../repositories/prisma-user.repository.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { AppError } from '../errors/app-errors.js'
import { tokenService } from './token.service.js'

class AuthService {
  async register(input: RegisterDto) {
    const { phone, email, username, password, gender } = input
    const birthday = new Date(input.birthday)

    if (Number.isNaN(birthday.getTime())) {
      throw new AppError(400, 'INVALID_BIRTHDAY', 'Birthday is invalid')
    }

    const userWithPhone = await userRepository.findByPhone(phone)

    if (userWithPhone) {
      throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'Phone already exists')
    }

    const userWithEmail = await userRepository.findByEmail(email)

    if (userWithEmail) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists')
    }

    const userWithUsername = await userRepository.findByUsername(username)

    if (userWithUsername) {
      throw new AppError(
        409,
        'USERNAME_ALREADY_EXISTS',
        'Username already exists',
      )
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

  async login(input: LoginUserDto) {
    const user = await userRepository.findByEmail(input.email)

    if (!user) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect',
      )
    }

    const passwordMatches = await comparePassword(input.password, user.password)

    if (!passwordMatches) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect',
      )
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'ACCOUNT_NOT_ACTIVE', 'Account is not active')
    }

    const accessToken = tokenService.createAccessToken(String(user.id))

    return {
      accessToken,
      user: {
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
      },
    }
  }
}

export const authService = new AuthService()
