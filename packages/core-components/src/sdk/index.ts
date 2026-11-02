import {
  type JWTIntegration,
  type JWTSalesChannel,
  type JWTWebApp,
  jwtDecode,
} from "@commercelayer/js-auth"
import type {
  ApiVersion,
  CommerceLayerClient,
  ErrorObj,
  RequestObj,
  ResponseObj,
} from "@commercelayer/sdk"
import { CommerceLayer as Sdk } from "@commercelayer/sdk"

/**
 * The API version every request is pinned to.
 *
 * Up to `8.0.0-beta.11` the SDK was a legacy build: `API_SUPPORTED_VERSIONS` was
 * empty, so the option did not exist and requests went to the unversioned
 * `/api/...`. From `8.0.2` the build is version-aware, the option is required,
 * and the value becomes a path segment - `/api/2026-05/orders`.
 *
 * `2026-05` is the schema the shipped types are generated from
 * (`API_SCHEMA_VERSION`), so it is the only value that keeps the responses and
 * the types describing the same API. The other accepted value is `2017-08`.
 */
const API_VERSION: ApiVersion = "2026-05"

type RequestInterceptor = (request: RequestObj) => RequestObj | Promise<RequestObj>
type ResponseInterceptor = (response: ResponseObj) => ResponseObj | Promise<ResponseObj>
type ErrorInterceptor = (error: ErrorObj) => ErrorObj | Promise<ErrorObj>

export type InterceptorManager = {
  request?: {
    onSuccess?: RequestInterceptor
    onFailure?: ErrorInterceptor
  }
  response?: {
    onSuccess?: ResponseInterceptor
    onFailure?: ErrorInterceptor
  }
  rawReader?: {
    onSuccess?: ResponseInterceptor
    onFailure?: ResponseInterceptor
  }
}

export function getSdk({
  accessToken,
  interceptors,
}: {
  accessToken: string
  interceptors?: InterceptorManager
}): CommerceLayerClient {
  const { payload } = jwtDecode(accessToken)
  const { organization } = payload as JWTIntegration | JWTWebApp | JWTSalesChannel
  const sdk = Sdk({ accessToken, organization: organization.slug, apiVersion: API_VERSION })
  if (interceptors?.request != null) {
    sdk.addRequestInterceptor(interceptors.request.onSuccess, interceptors.request.onFailure)
  }
  if (interceptors?.response != null) {
    sdk.addResponseInterceptor(interceptors.response.onSuccess, interceptors.response.onFailure)
  }
  if (interceptors?.rawReader != null) {
    sdk.addRawResponseReader()
  }
  return sdk
}
