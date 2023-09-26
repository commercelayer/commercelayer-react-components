import { authentication } from '@commercelayer/js-auth'
import { useEffect, useState } from 'react'

interface UseGetTokenOptions {
  userMode?: boolean
}

const salesChannel = {
  clientId: '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
  slug: 'the-blue-brand-3',
  scope: 'market:58',
  domain: 'commercelayer.co'
}

const customer = {
  username: 'bruce@wayne.com',
  password: '123456'
}

export function useGetToken<T extends UseGetTokenOptions>(
  options?: T
): {
  accessToken: string
  endpoint: string
} {
  const [token, setToken] = useState('')
  const clientId = salesChannel.clientId
  const slug = salesChannel.slug
  const scope = salesChannel.scope
  const domain = salesChannel.domain
  const user =
    options?.userMode != null
      ? {
          username: customer.username,
          password: customer.password
        }
      : undefined
  useEffect(() => {
    const getToken = async (): Promise<void> => {
      const token =
        user == null
          ? await authentication('client_credentials', {
              clientId,
              slug,
              scope,
              domain
            })
          : await authentication('password', {
              clientId,
              slug,
              scope,
              domain,
              ...user
            })
      setToken(token.accessToken)
    }
    void getToken()
  }, [])
  return {
    accessToken: token,
    endpoint: `https://${slug}.${domain}`
  }
}
