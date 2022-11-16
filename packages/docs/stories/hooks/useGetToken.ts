import { getSalesChannelToken } from '@commercelayer/js-auth'
import { useEffect, useState } from 'react'
import { customer, salesChannel } from '../assets/config'

interface UseGetTokenOptions {
  userMode?: boolean
}

export default function useGetToken<T extends UseGetTokenOptions>(
  options?: T
): {
  accessToken: string
  endpoint: string
} {
  const [token, setToken] = useState('')
  const clientId = salesChannel.clientId
  const endpoint = salesChannel.endpoint
  const scope = salesChannel.scope
  const user = options?.userMode
    ? {
        username: customer.username,
        password: customer.password
      }
    : undefined
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      const token = await getSalesChannelToken(
        {
          clientId,
          endpoint,
          scope
        },
        user
      )
      if (token) setToken(token.accessToken)
    }
    void getToken()
  }, [])
  return {
    accessToken: token,
    endpoint
  }
}
