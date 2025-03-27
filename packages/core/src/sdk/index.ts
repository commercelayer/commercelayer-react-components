import sdk, { type CommerceLayerClient } from "@commercelayer/sdk"
import { jwtDecode } from "jwt-decode"
import type { Jwt, RequestConfig } from "src/types/index.js"

export function getSdk({ accessToken }: RequestConfig): CommerceLayerClient {
  const organization = jwtDecode<Jwt>(accessToken).organization.slug
  return sdk({ accessToken, organization })
}
