export type FriendshipStatus = 'PENDING' | 'ACCEPTED'

export type PublicUser = {
  id: number
  username: string
  avatarUrl: string | null
}

export type Friendship = {
  id: number
  userLowId: number
  userHighId: number
  requestedById: number
  status: FriendshipStatus
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
}

export type FriendRequest = {
  requestId: number
  user: PublicUser | null
  createdAt: string
}

export type Friend = {
  friendshipId: number
  user: PublicUser | null
  friendsSince: string | null
}
