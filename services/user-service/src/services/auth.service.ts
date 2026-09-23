import type { RegisterDto } from '../dtos/register.dto.js'
import type { LoginUserDto } from '../dtos/login-user.dto.js'
import type { UserRepository } from '../repositories/user.repository.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { AppError } from '../errors/app-errors.js'
import type { TokenService } from './token.service.js'
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository.js'
import { hashToken } from '../utils/token-hash.js'
import { env } from '../config/env.js'
import type { RefreshTokenDto } from '../dtos/refresh-token.dto.js'

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}
  async register(input: RegisterDto) {
    const { phone, email, username, password, gender } = input
    const birthday = new Date(input.birthday)

    if (Number.isNaN(birthday.getTime())) {
      throw new AppError(400, 'INVALID_BIRTHDAY', 'Birthday is invalid')
    }

    const userWithPhone = await this.userRepository.findByPhone(phone)

    if (userWithPhone) {
      throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'Phone already exists')
    }

    const userWithEmail = await this.userRepository.findByEmail(email)

    if (userWithEmail) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists')
    }

    const passwordHash = await hashPassword(password)

    const user = await this.userRepository.create({
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
    const user = await this.userRepository.findByEmail(input.email)

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

    if (user.isBanned) {
      throw new AppError(403, 'ACCOUNT_BANNED', 'Account has been banned')
    }

    const accessToken = this.tokenService.createAccessToken({
      userId: user.id,
      role: user.role,
      username: user.username,
    })
    const refreshToken = this.tokenService.createRefreshToken()
    const expiresAt = new Date(
      Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
    )

    await this.refreshTokenRepository.create({
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
    })

    return {
      accessToken,
      refreshToken,
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

  async logout(input: RefreshTokenDto): Promise<void> {
    const storedToken = await this.refreshTokenRepository.findByTokenHash(
      hashToken(input.refreshToken),
    )

    if (!storedToken || storedToken.revokedAt !== null) {
      return
    }

    await this.refreshTokenRepository.revokeById(storedToken.id)
  }

  async refresh(input: RefreshTokenDto) {
    const tokenHash = hashToken(input.refreshToken)
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash)

    if (
      !storedToken ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Refresh token is invalid',
      )
    }

    const user = await this.userRepository.findById(storedToken.userId)

    if (!user || user.status !== 'ACTIVE' || user.isBanned) {
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Refresh token is invalid',
      )
    }

    await this.refreshTokenRepository.revokeById(storedToken.id)

    const accessToken = this.tokenService.createAccessToken({
      userId: user.id,
      role: user.role,
      username: user.username,
    })
    const refreshToken = this.tokenService.createRefreshToken()
    const expiresAt = new Date(
      Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
    )

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    })

    return {
      accessToken,
      refreshToken,
    }
  }
}
