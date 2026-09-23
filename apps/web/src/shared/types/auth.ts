import type { User } from './user'

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: User
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput & {
  phone: string
  username: string
  birthday: string
  gender: User['gender']
}
