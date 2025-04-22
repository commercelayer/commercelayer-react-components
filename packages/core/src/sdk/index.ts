import {
  type JWTIntegration,
  type JWTSalesChannel,
  type JWTWebApp,
  jwtDecode,
} from "@commercelayer/js-auth"
import sdk, { type CommerceLayerClient } from "@commercelayer/sdk"
import type { RequestConfig } from "#types"

/**
 * Get the Commerce Layer SDK instance
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @returns {CommerceLayerClient} - The Commerce Layer SDK instance.
 */
export function getSdk({ accessToken }: RequestConfig): CommerceLayerClient {
  const { payload } = jwtDecode(accessToken)
  const { organization } = payload as
    | JWTIntegration
    | JWTWebApp
    | JWTSalesChannel
  const slug = organization.slug
  return sdk({ accessToken, organization: slug })
}
