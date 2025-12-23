import {
  type JWTIntegration,
  type JWTSalesChannel,
  type JWTWebApp,
  jwtDecode,
} from "@commercelayer/js-auth"
import sdk from "@commercelayer/sdk"
import type { RequestConfig } from "#types"

/**
 * Get the Commerce Layer SDK instance
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @returns {void}
 */
export function getSdk({ accessToken }: RequestConfig): void {
  const { payload } = jwtDecode(accessToken)
  const { organization } = payload as
    | JWTIntegration
    | JWTWebApp
    | JWTSalesChannel
  const slug = organization.slug
  const cl = sdk({ accessToken, organization: slug })
  cl.addRawResponseReader()
}
