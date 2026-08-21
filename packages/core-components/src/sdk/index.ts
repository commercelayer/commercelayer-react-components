import {
  type JWTIntegration,
  type JWTSalesChannel,
  type JWTWebApp,
  jwtDecode,
} from "@commercelayer/js-auth"
import type { CommerceLayerClient, ErrorObj, RequestObj, ResponseObj } from "@commercelayer/sdk"
import { CommerceLayer as Sdk } from "@commercelayer/sdk"

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
  const sdk = Sdk({ accessToken, organization: organization.slug })
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
