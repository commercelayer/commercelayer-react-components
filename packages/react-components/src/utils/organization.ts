import { getSdk } from "@commercelayer/core-components"
import type { Organization } from "@commercelayer/sdk"
import { type DefaultMfeConfig, getMfeConfig } from "@commercelayer/organization-config"
import { useEffect, useState } from "react"
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

  // A network failure here degrades to `null`, the value this function already
  // returns when there is no config to give — and every caller reads the result
  // optionally, falling back to a computed application link.
  //
  // Rejecting instead leaves eight call sites to catch the same thing, and none
  // of them do: several are `useEffect` bodies and async click handlers, where
  // the rejection goes unhandled and reaches the host application. Under
  // `next dev` that raises the error overlay, which covers the page and absorbs
  // every click — so one optional setting failing to load takes the whole
  // checkout down. Only the request is guarded: a bad token or a malformed
  // config is a fault to surface, not a blip to absorb.
  let organization: Organization
  try {
    organization = await sdk.organization.retrieve({
      fields: {
        organizations: ["id", "config"],
      },
    })
  } catch (error) {
    // `warn`, not `error`, and the level is load-bearing rather than a matter
    // of taste: `next dev` promotes a `console.error` to an overlay issue whose
    // dialog covers the page and absorbs every click. Reporting a condition we
    // have just recovered from at that level takes the checkout down as surely
    // as not catching it at all — verified by aborting this request and
    // watching a click time out on an element that was plainly visible.
    console.warn("Could not fetch the organization config, continuing without it:", error)
    return null
  }

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
