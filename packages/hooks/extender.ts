import { getAccessToken } from "@commercelayer/core"
import { test } from "vitest"

const clientId = import.meta.env.VITE_SALES_CHANNEL_CLIENT_ID
const integrationClientId = import.meta.env.VITE_INTEGRATION_CLIENT_ID
const integrationClientSecret = import.meta.env.VITE_INTEGRATION_CLIENT_SECRET
const scope = import.meta.env.VITE_SALES_CHANNEL_SCOPE
const domain = import.meta.env.VITE_DOMAIN

// Separate caches per token type to avoid cross-contamination between fixtures
let salesChannelToken: Awaited<ReturnType<typeof getAccessToken>> | undefined
let integrationToken: Awaited<ReturnType<typeof getAccessToken>> | undefined

export interface CoreTestInterface {
  accessToken: Awaited<ReturnType<typeof getAccessToken>>
  config: {
    clientId: string
    scope?: string
    domain: string
  }
}

/**
 * This test is used to run integration tests with the sales channel client.
 */
export const coreTest = test.extend<CoreTestInterface>({
  // biome-ignore lint/correctness/noEmptyPattern: need to object destructure as the first argument
  accessToken: async ({}, use) => {
    if (salesChannelToken === undefined) {
      salesChannelToken = await getAccessToken({
        grantType: "client_credentials",
        config: {
          clientId,
          scope,
          domain,
        },
      })
    }
    use(salesChannelToken)
  },
  config: {
    clientId,
    scope,
    domain,
  },
})

/**
 * This test is used to run integration tests with the integration client.
 */
export const coreIntegrationTest = test.extend<CoreTestInterface>({
  // biome-ignore lint/correctness/noEmptyPattern: need to object destructure as the first argument
  accessToken: async ({}, use) => {
    if (integrationToken === undefined) {
      integrationToken = await getAccessToken({
        grantType: "client_credentials",
        config: {
          clientId: integrationClientId,
          clientSecret: integrationClientSecret,
          domain,
        },
      })
    }
    use(integrationToken)
  },
  config: {
    clientId: integrationClientId,
    domain,
  },
})
