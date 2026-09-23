import type { PrismaClient } from '../generated/prisma/client.js'
import { prisma } from '../config/prisma.js'
import type { CreateUserData, UserRepository } from './user.repository.js'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly database: PrismaClient) {}

  async findById(id: number) {
    return this.database.user.findUnique({
      where: { id },
    })
  }

  async findByPhone(phone: string) {
    return this.database.user.findUnique({
      where: { phone },
    })
  }

  async findByEmail(email: string) {
    return this.database.user.findUnique({
      where: { email },
    })
  }

  async create(data: CreateUserData) {
    return this.database.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        username: data.username,
        password: data.password,
        birthday: data.birthday,
        gender: data.gender,
      },
    })
  }
}

export const userRepository = new PrismaUserRepository(prisma)
