import { test } from "vitest"
import { getAccessToken } from "./src/auth/getAccessToken.js"

const clientId = import.meta.env.VITE_TEST_CLIENT_ID
const integrationClientId = import.meta.env.VITE_TEST_CLIENT_ID_INTEGRATION
const integrationClientSecret = import.meta.env.VITE_TEST_CLIENT_SECRET
const scope = import.meta.env.VITE_TEST_MARKET_ID
const domain = import.meta.env.VITE_TEST_DOMAIN

const hasSalesChannelCredentials = Boolean(clientId && domain)
const hasIntegrationCredentials = Boolean(integrationClientId && integrationClientSecret && domain)

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
 * Skipped when the sales channel credentials are not configured in the root `.env`.
 */
export const coreTest = test
  .extend<CoreTestInterface>({
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
      await use(salesChannelToken)
    },
    config: {
      clientId,
      scope,
      domain,
    },
  })
  .skipIf(!hasSalesChannelCredentials)

/**
 * This test is used to run integration tests with the integration client.
 * Skipped when the integration credentials are not configured in the root `.env`.
 */
export const coreIntegrationTest = test
  .extend<CoreTestInterface>({
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
      await use(integrationToken)
    },
    config: {
      clientId: integrationClientId,
      domain,
    },
  })
  .skipIf(!hasIntegrationCredentials)
