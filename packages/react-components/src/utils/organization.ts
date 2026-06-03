import { type DefaultMfeConfig, getMfeConfig } from "@commercelayer/organization-config"
import { useEffect, useState } from "react"
import { getSdk } from "@commercelayer/core"
import { jwt } from "./jwt"

export interface OrganizationConfig {
  accessToken: string
  params: Parameters<typeof getMfeConfig>[0]["params"]
}

/**
 * Get organization config from Commerce Layer
 *
 */
export async function getOrganizationConfig(
  config: OrganizationConfig
): Promise<DefaultMfeConfig | null> {
  const { market } = jwt(config.accessToken)
  const sdk = getSdk({ accessToken: config.accessToken })
  const organization = await sdk.organization.retrieve({
    fields: {
      organizations: ["id", "config"],
    },
  })
  return getMfeConfig({
    jsonConfig: organization.config ?? {},
    market: `market:id:${market.id.join(",")}`,
    params: config.params,
  })
}

export function useOrganizationConfig({
  accessToken,
  params,
}: Partial<OrganizationConfig>): DefaultMfeConfig | null {
  const [organizationConfig, setOrganizationConfig] = useState<DefaultMfeConfig | null>(null)
  useEffect(() => {
    if (accessToken == null) return
    getOrganizationConfig({
      accessToken,
      params,
    }).then((config) => {
      setOrganizationConfig(config)
    })
  }, [accessToken, params])
  return organizationConfig
}
