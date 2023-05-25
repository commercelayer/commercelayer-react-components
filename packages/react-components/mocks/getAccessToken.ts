import getToken, { type TokenType } from 'specs/utils/getToken'

let accessToken: string | undefined
let endpoint: string | undefined
let customerAccessToken: string | undefined
let customerEmpty: string | undefined
let customerWithLowData: string | undefined

export async function getAccessToken(
  type: TokenType = 'sales_channel'
): ReturnType<typeof getToken> {
  if (endpoint != null) {
    switch (type) {
      case 'customer':
        if (customerAccessToken != null) {
          return {
            accessToken: customerAccessToken,
            endpoint
          }
        }
        break
      case 'customer_empty':
        if (customerEmpty != null) {
          return {
            accessToken: customerEmpty,
            endpoint
          }
        }
        break
      case 'customer_with_low_data':
        if (customerWithLowData != null) {
          return {
            accessToken: customerWithLowData,
            endpoint
          }
        }
        break
      case 'sales_channel':
      default:
        if (accessToken != null) {
          return {
            accessToken,
            endpoint
          }
        }
        break
    }
  }
  const config = await getToken(type)
  const token = config.accessToken
  switch (type) {
    case 'customer':
      customerAccessToken = token
      break
    case 'customer_empty':
      customerEmpty = token
      break
    case 'customer_with_low_data':
      customerWithLowData = token
      break
    case 'sales_channel':
    default:
      accessToken = token
      break
  }
  endpoint = config.endpoint
  return {
    accessToken: token,
    endpoint
  }
}
