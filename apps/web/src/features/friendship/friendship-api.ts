import { authenticatedApiRequest } from '../../shared/api/http-client'
import type {
  Friend,
  FriendRequest,
  Friendship,
  FriendshipOverview,
  PublicUser,
} from './friendship-types'

export function searchUserByPhone(phone: string): Promise<PublicUser> {
  return authenticatedApiRequest<PublicUser>({
    url: '/users/search',
    method: 'GET',
    params: { phone },
  })
}

export function sendFriendRequest(receiverId: number): Promise<Friendship> {
  return authenticatedApiRequest<Friendship>({
    url: '/friendships/requests',
    method: 'POST',
    data: { receiverId },
  })
}

export function getIncomingRequests(): Promise<FriendRequest[]> {
  return authenticatedApiRequest<FriendRequest[]>({
    url: '/friendships/requests/incoming',
    method: 'GET',
  })
}

export function getOutgoingRequests(): Promise<FriendRequest[]> {
  return authenticatedApiRequest<FriendRequest[]>({
    url: '/friendships/requests/outgoing',
    method: 'GET',
  })
}

export function acceptFriendRequest(requestId: number): Promise<Friendship> {
  return authenticatedApiRequest<Friendship>({
    url: `/friendships/requests/${requestId}/accept`,
    method: 'PATCH',
  })
}

export function rejectFriendRequest(requestId: number): Promise<void> {
  return authenticatedApiRequest<void>({
    url: `/friendships/requests/${requestId}/reject`,
    method: 'PATCH',
  })
}

export function cancelFriendRequest(requestId: number): Promise<void> {
  return authenticatedApiRequest<void>({
    url: `/friendships/requests/${requestId}`,
    method: 'DELETE',
  })
}

export function getFriends(): Promise<Friend[]> {
  return authenticatedApiRequest<Friend[]>({
    url: '/friendships',
    method: 'GET',
  })
}

export function removeFriend(friendId: number): Promise<void> {
  return authenticatedApiRequest<void>({
    url: `/friendships/${friendId}`,
    method: 'DELETE',
  })
}

export async function getFriendshipOverview(): Promise<FriendshipOverview> {
  const [incoming, outgoing, friends] = await Promise.all([
    getIncomingRequests(),
    getOutgoingRequests(),
    getFriends(),
  ])

  return { incoming, outgoing, friends }
}
