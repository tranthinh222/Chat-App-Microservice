import { HttpUserServiceClient } from '../clients/user-service.client.js'
import { env } from './env.js'

export const userServiceClient = new HttpUserServiceClient(
  env.userServiceUrl,
  env.userServiceRequestTimeoutMs,
)
