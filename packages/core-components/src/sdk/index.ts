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
 * The SDK types `apiVersion` as optional and builds unversioned URLs when it is
 * omitted, so leaving it out silently changes which API surface we talk to. Kept as
 * an explicit literal rather than derived from `API_SUPPORTED_VERSIONS`: the types are
 * generated for one version, so an SDK bump and a version change should be reviewed
 * together instead of one dragging the other along.
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
  const sdk = Sdk({
    accessToken,
    organization: organization.slug,
    apiVersion: API_VERSION,
  })
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
