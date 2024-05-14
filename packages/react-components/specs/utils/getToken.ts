import { authenticate } from '@commercelayer/js-auth'

export type TokenType =
  | 'sales_channel'
  | 'customer'
  | 'customer_empty'
  | 'customer_with_low_data'

export default async function getToken(
  type: TokenType = 'sales_channel'
): Promise<{ accessToken: string | undefined; endpoint: string }> {
  const clientId = process.env['VITE_TEST_CLIENT_ID'] ?? ''
  const slug = process.env['VITE_TEST_SLUG'] ?? ''
  const scope = process.env['VITE_TEST_MARKET_ID'] ?? ''
  const domain = process.env['VITE_TEST_DOMAIN'] ?? ''
  const user =
    type === 'customer'
      ? {
          username: process.env['VITE_TEST_USERNAME'] ?? '',
          password: process.env['VITE_TEST_PASSWORD'] ?? ''
        }
      : type === 'customer_empty'
        ? {
            username: process.env['VITE_TEST_USERNAME_EMPTY'] ?? '',
            password: process.env['VITE_TEST_PASSWORD_EMPTY'] ?? ''
          }
        : type === 'customer_with_low_data'
          ? {
              username: process.env['VITE_TEST_USERNAME_WITH_LOW_DATA'] ?? '',
              password: process.env['VITE_TEST_PASSWORD_WITH_LOW_DATA'] ?? ''
            }
          : undefined
  const { accessToken } =
    user == null
      ? await authenticate('client_credentials', {
          clientId,
          domain,
          scope
        })
      : await authenticate('password', {
          clientId,
          domain,
          scope,
          ...user
        })
  return {
    accessToken,
    endpoint: `https://${slug}.${domain}`
  }
}
