import type { User, Gender } from '../generated/prisma/client.js'

export type CreateUserData = {
  phone: string
  email: string
  username: string
  password: string
  birthday: Date
  gender: Gender
}
export interface UserRepository {
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}
