export type User = {
  id: number
  phone: string
  email: string
  username: string
  birthday: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  avatarUrl: string | null
  status: 'ACTIVE' | 'INACTIVE'
  role: 'USER' | 'ADMIN'
  isBanned: boolean
  createdAt?: string
}
