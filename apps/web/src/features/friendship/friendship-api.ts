import type { AxiosRequestConfig } from 'axios'
import { apiRequest } from '../../shared/api/http-client'
import { readSession } from '../../shared/lib/auth-storage'
import type {
  Friend,
  FriendRequest,
  Friendship,
  PublicUser,
} from './friendship-types'

function authenticatedRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const accessToken = readSession()?.accessToken

  if (!accessToken) {
    throw new Error('Authentication is required')
  }

  return apiRequest<T>({
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function searchUserByPhone(phone: string): Promise<PublicUser> {
  return authenticatedRequest<PublicUser>({
    url: '/users/search',
    method: 'GET',
    params: { phone },
  })
}

export function sendFriendRequest(receiverId: number): Promise<Friendship> {
  return authenticatedRequest<Friendship>({
    url: '/friendships/requests',
    method: 'POST',
    data: { receiverId },
  })
}

export function getIncomingRequests(): Promise<FriendRequest[]> {
  return authenticatedRequest<FriendRequest[]>({
    url: '/friendships/requests/incoming',
    method: 'GET',
  })
}

export function getOutgoingRequests(): Promise<FriendRequest[]> {
  return authenticatedRequest<FriendRequest[]>({
    url: '/friendships/requests/outgoing',
    method: 'GET',
  })
}

export function acceptFriendRequest(requestId: number): Promise<Friendship> {
  return authenticatedRequest<Friendship>({
    url: `/friendships/requests/${requestId}/accept`,
    method: 'PATCH',
  })
}

export function rejectFriendRequest(requestId: number): Promise<void> {
  return authenticatedRequest<void>({
    url: `/friendships/requests/${requestId}/reject`,
    method: 'PATCH',
  })
}

export function cancelFriendRequest(requestId: number): Promise<void> {
  return authenticatedRequest<void>({
    url: `/friendships/requests/${requestId}`,
    method: 'DELETE',
  })
}

export function getFriends(): Promise<Friend[]> {
  return authenticatedRequest<Friend[]>({
    url: '/friendships',
    method: 'GET',
  })
}

export function removeFriend(friendId: number): Promise<void> {
  return authenticatedRequest<void>({
    url: `/friendships/${friendId}`,
    method: 'DELETE',
  })
}
