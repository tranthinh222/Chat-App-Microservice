import { authenticatedApiRequest } from '../../shared/api/http-client'
import type { User } from '../../shared/types/user'

export type UserProfile = Pick<
  User,
  'id' | 'username' | 'birthday' | 'gender' | 'avatarUrl' | 'status'
> & {
  createdAt: string
}

export function getUserProfile(userId: number): Promise<UserProfile> {
  return authenticatedApiRequest<UserProfile>({
    url: `/users/${userId}`,
    method: 'GET',
  })
}
