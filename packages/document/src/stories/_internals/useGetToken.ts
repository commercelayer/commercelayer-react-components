import { authenticate } from '@commercelayer/js-auth'
import { useEffect, useMemo, useState } from 'react'
import Cookie from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const salesChannel = {
  clientId: 'Z5ypiDlsqgV8twWRz0GabrJvTKXad4U-PMoVAU-XvV0',
  slug: 'react-components-store',
  scope: 'market:15283',
  domain: 'commercelayer.io'
}
const savedCustomerWithOrders = {
  username: 'bruce@wayne.com',
  password: '123456'
}

type UserMode = 'customer' | 'customer-orders' | 'guest'
interface UseGetTokenOptions {
  mode?: UserMode
}

const getAccessTokenCookieName = (mode: UserMode): string =>
  `clToken.${salesChannel.slug}.${mode}`

const getCustomerLoginCookieName = (mode: UserMode): string =>
  `clToken.customerLogin.${mode}`

export function useGetToken<T extends UseGetTokenOptions>(
  options?: T
): {
  accessToken: string
  endpoint: string
} {
  const mode = options?.mode ?? 'guest'
  const [accessToken, setAccessToken] = useState(
    Cookie.get(getAccessTokenCookieName(mode)) ?? ''
  )
  const clientId = salesChannel.clientId
  const slug = salesChannel.slug
  const scope = salesChannel.scope
  const domain = salesChannel.domain

  const initToken = useMemo(() => {
    return async () => {
      const user =
        mode === 'customer'
          ? await retrieveCustomerData({
              clientId,
              slug,
              scope,
              domain,
              mode
            })
          : mode === 'customer-orders'
            ? savedCustomerWithOrders
            : undefined

      await generateNewToken({
        clientId,
        slug,
        scope,
        domain,
        user,
        mode
      }).then(({ accessToken, expires }) => {
        setAccessToken(accessToken)
        Cookie.set(getAccessTokenCookieName(mode), accessToken, { expires })
      })
    }
  }, [])

  useEffect(() => {
    if (
      accessToken == null ||
      accessToken === '' ||
      isTokenExpired({ accessToken, compareTo: new Date() })
    ) {
      initToken()
    }
  }, [accessToken])

  return {
    accessToken,
    endpoint: `https://${slug}.${domain}`
  }
}

async function retrieveCustomerData({
  clientId,
  slug,
  scope,
  domain,
  mode
}: {
  clientId: string
  slug: string
  scope: string
  domain: string
  mode: UserMode
}): Promise<{
  username: string
  password: string
}> {
  const existingUser = Cookie.get(getCustomerLoginCookieName(mode))
  const savedEmail = parseEmailAddress(existingUser?.split(':')[0])
  const savedPassword = parsePassword(existingUser?.split(':')[1])

  if (savedEmail != null && savedPassword != null) {
    return {
      username: savedEmail,
      password: savedPassword
    }
  }

  const newEmail = `user-${generateRandomString(5)}-${generateRandomString(
    5
  )}@domain.com`
  const newPassword = generateRandomString(10)

  const guestToken = await generateNewToken({
    clientId,
    slug,
    scope,
    domain,
    mode
  })

  await createNewCustomer({
    email: newEmail,
    password: newPassword,
    salesChannelToken: guestToken.accessToken,
    slug,
    domain
  })

  Cookie.set(getCustomerLoginCookieName(mode), `${newEmail}:${newPassword}`)

  return {
    username: newEmail,
    password: newPassword
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function generateNewToken({
  clientId,
  slug,
  scope,
  domain,
  user,
  mode
}: {
  clientId: string
  slug: string
  scope: string
  domain: string
  user?: { username: string; password: string }
  mode: UserMode
}) {
  return user == null
    ? await authenticate('client_credentials', {
        clientId,
        scope,
        domain
      })
    : await authenticate('password', {
        clientId,
        scope,
        domain,
        ...user
      }).then((res) => {
        if (res != null && 'error' in res) {
          Cookie.remove(getCustomerLoginCookieName('customer'))
          Cookie.remove(getCustomerLoginCookieName('customer-orders'))
          Cookie.remove(getAccessTokenCookieName(mode))
        }
        return res
      })
}

function isTokenExpired({
  accessToken,
  compareTo
}: {
  accessToken?: string
  compareTo: Date
}): boolean {
  if (accessToken == null || accessToken === '') {
    return true
  }

  try {
    const { exp } = jwtDecode<{ exp: number }>(accessToken)

    if (exp == null) {
      return true
    }

    const nowTime = Math.trunc(compareTo.getTime() / 1000)
    return nowTime > exp
  } catch {
    return true
  }
}

function generateRandomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function parseEmailAddress(email?: string): string | undefined {
  const re = /^[a-zA-Z0-9._%+-]+@domain\.com$/
  if (email == null) {
    return undefined
  }
  return re.test(email) ? email : undefined
}

function parsePassword(password?: string): string | undefined {
  return password?.length === 10 ? password : undefined
}

async function createNewCustomer({
  email,
  password,
  salesChannelToken,
  slug,
  domain
}: {
  email: string
  password: string
  salesChannelToken: string
  slug: string
  domain: string
}): Promise<void> {
  const newCustomer = await fetch(`https://${slug}.${domain}/api/customers`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${salesChannelToken}`
    },
    body: JSON.stringify({
      data: {
        type: 'customers',
        attributes: {
          email,
          password
        }
      }
    })
  })

  if (newCustomer.status !== 201) {
    throw new Error('Error creating customer')
  }
}
