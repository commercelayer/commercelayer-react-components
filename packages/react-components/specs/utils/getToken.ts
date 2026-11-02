import { authenticate } from "@commercelayer/js-auth"

export type TokenType =
  | "sales_channel"
  | "customer"
  | "customer_empty"
  | "customer_with_low_data"
  /**
   * A confidential integration token, for fixtures that need to read resources a
   * storefront is not allowed to list. API version `2026-05` refuses
   * `GET /sku_lists` to a sales channel token - the legacy unversioned API
   * allowed it - so a spec that needs a SKU list id has to ask for one with
   * credentials that may. The component under test still runs on the sales
   * channel token, which is what a storefront has.
   */
  | "integration"

export default async function getToken(
  type: TokenType = "sales_channel"
): Promise<{ accessToken: string | undefined; endpoint: string | undefined }> {
  const clientId = process.env["VITE_TEST_CLIENT_ID"]
  const slug = process.env["VITE_TEST_SLUG"]
  const scope = process.env["VITE_TEST_MARKET_ID"]
  const domain = process.env["VITE_TEST_DOMAIN"]

  if (!clientId || !slug || !domain) {
    return { accessToken: undefined, endpoint: undefined }
  }

  if (type === "integration") {
    const clientSecret = process.env["VITE_TEST_CLIENT_SECRET"]
    const integrationClientId = process.env["VITE_TEST_CLIENT_ID_INTEGRATION"]
    if (!integrationClientId || !clientSecret) {
      return { accessToken: undefined, endpoint: undefined }
    }
    const { accessToken } = await authenticate("client_credentials", {
      clientId: integrationClientId,
      clientSecret,
      domain,
    })
    return { accessToken, endpoint: `https://${slug}.${domain}` }
  }

  const user =
    type === "customer"
      ? {
          username: process.env["VITE_TEST_USERNAME"] ?? "",
          password: process.env["VITE_TEST_PASSWORD"] ?? "",
        }
      : type === "customer_empty"
        ? {
            username: process.env["VITE_TEST_USERNAME_EMPTY"] ?? "",
            password: process.env["VITE_TEST_PASSWORD_EMPTY"] ?? "",
          }
        : type === "customer_with_low_data"
          ? {
              username: process.env["VITE_TEST_USERNAME_WITH_LOW_DATA"] ?? "",
              password: process.env["VITE_TEST_PASSWORD_WITH_LOW_DATA"] ?? "",
            }
          : undefined
  const { accessToken } =
    user == null
      ? await authenticate("client_credentials", {
          clientId,
          domain,
          scope: scope ?? "",
        })
      : await authenticate("password", {
          clientId,
          domain,
          scope: scope ?? "",
          ...user,
        })
  return {
    accessToken,
    endpoint: `https://${slug}.${domain}`,
  }
}
