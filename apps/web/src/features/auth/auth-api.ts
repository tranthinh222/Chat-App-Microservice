import type {
  AuthSession,
  LoginInput,
  RegisterInput,
} from '../../shared/types/auth'
import type { User } from '../../shared/types/user'
import { apiRequest } from '../../shared/api/http-client'

export function login(input: LoginInput): Promise<AuthSession> {
  return apiRequest<AuthSession>({
    url: '/auth/login',
    method: 'POST',
    data: input,
  })
}

export function register(input: RegisterInput): Promise<User> {
  return apiRequest<User>({
    url: '/auth/register',
    method: 'POST',
    data: input,
  })
}

export function refresh(
  refreshToken: string,
): Promise<Omit<AuthSession, 'user'>> {
  return apiRequest<Omit<AuthSession, 'user'>>({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken },
  })
}

export function logout(refreshToken: string): Promise<void> {
  return apiRequest<void>({
    url: '/auth/logout',
    method: 'POST',
    data: { refreshToken },
  })
}
