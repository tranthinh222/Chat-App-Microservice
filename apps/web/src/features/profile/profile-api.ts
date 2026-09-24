import { apiRequest } from '../../shared/api/http-client'
import { readSession } from '../../shared/lib/auth-storage'
import type { User } from '../../shared/types/user'

export type UserProfile = Pick<
  User,
  'id' | 'username' | 'birthday' | 'gender' | 'avatarUrl' | 'status'
> & {
  createdAt: string
}

export function getUserProfile(userId: number): Promise<UserProfile> {
  const accessToken = readSession()?.accessToken

  if (!accessToken) {
    throw new Error('Authentication is required')
  }

  return apiRequest<UserProfile>({
    url: `/users/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
