import type { ResourcesConfig } from "@commercelayer/sdk"

export interface RequestConfig {
  accessToken: string
  id?: string
  params?: unknown
  options?: ResourcesConfig
}
