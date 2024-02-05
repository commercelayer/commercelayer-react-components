import { jwt } from './jwt'

/**
 * Get the customer id from the token
 * @param accessToken The access token
 * @returns string
 */
export function getCustomerIdByToken(accessToken: string): string | undefined {
  return jwt(accessToken)?.owner?.id
}
