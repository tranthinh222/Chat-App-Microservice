import type { UserServiceClient } from '../clients/user-service.client.js'
import type { FriendshipRepository } from '../repositories/friendship.repository.js'

export class FriendshipService {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userServiceClient: UserServiceClient,
  ) {}
}
