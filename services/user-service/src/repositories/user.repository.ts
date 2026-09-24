import type { User, Gender } from '../generated/prisma/client.js'

export type CreateUserData = {
  phone: string
  email: string
  username: string
  password: string
  birthday: Date
  gender: Gender
}

export type UpdateUserData = {
  username?: string
  birthday?: Date
  gender?: Gender
  avatarUrl?: string | null
}

export interface UserRepository {
  findById(id: number): Promise<User | null>
  findByPhone(phone: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  updateById(id: number, data: UpdateUserData): Promise<User>
}
