import { test } from "vitest"
import { getAccessToken } from "./src/auth/getAccessToken.js"

const clientId = import.meta.env.VITE_SALES_CHANNEL_CLIENT_ID
const scope = import.meta.env.VITE_SALES_CHANNEL_SCOPE
const domain = import.meta.env.VITE_DOMAIN
let accessToken: ReturnType<typeof getAccessToken> = undefined

export const coreTest = test.extend({
  accessToken: async ({ _ }, use) => {
    if (accessToken == null) {
      accessToken = await getAccessToken({
        grantType: "client_credentials",
        config: {
          clientId,
          scope,
          domain,
        },
      })
    }
    use(accessToken)
    accessToken = undefined
  },
  config: {
    clientId,
    scope,
    domain,
  },
})
