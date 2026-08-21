import type { ResourcesConfig } from "@commercelayer/sdk"
import type { InterceptorManager } from "#sdk"

export interface RequestConfig {
  accessToken: string
  id?: string
  params?: unknown
  options?: ResourcesConfig
  interceptors?: InterceptorManager
}

export type BaseMetadataObject = Record<string, string | undefined | null>
