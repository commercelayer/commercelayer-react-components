import { jwt } from './jwt'

/**
 * Check if the token is a sales channel token
 * @param accessToken The access token
 * @returns boolean
 */
export function isGuestToken(accessToken: string): boolean {
  return jwt(accessToken).owner == null
}
