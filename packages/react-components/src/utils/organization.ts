import { getSdk } from "@commercelayer/core-components"
import { type DefaultMfeConfig, getMfeConfig } from "@commercelayer/organization-config"
import type { Organization } from "@commercelayer/sdk"
import { useEffect, useState } from "react"
import { jwt } from "./jwt"

export interface OrganizationConfig {
  accessToken: string
  params: Parameters<typeof getMfeConfig>[0]["params"]
}

/**
 * Resolved configs, keyed by token and params.
 *
 * The config is branding and a couple of URLs; it does not change within a page
 * load. Twelve call sites ask for it — several of them components that mount
 * more than once per order — and each was doing its own request. Fetched that
 * often, a transient failure here is likelier than it looks.
 *
 * **Only successes are kept.** A failure deletes its entry so the next caller
 * retries, because callers retrying independently is what made a blip
 * survivable in the first place — see the recovery note below. Caching a `null`
 * would freeze one bad moment for the life of the page.
 *
 * **A spec that mocks two different configs under one access token has to call
 * `resetOrganizationConfigCache` between them**, or the second gets the first.
 * That reset is deliberately *not* wired into the shared spec setup, and both
 * ways of doing it were tried: a static import there pulls `./jwt` into the
 * graph before any spec's `vi.mock` is registered, which unbinds the `jwtDecode`
 * mock four unrelated specs rely on; and a lazy import fails too, because
 * Vitest throws on reading an export that a wholesale module mock does not
 * define — which two specs are.
 */
const configCache = new Map<string, Promise<DefaultMfeConfig | null>>()

function configCacheKey(config: OrganizationConfig): string {
  return `${config.accessToken}|${JSON.stringify(config.params ?? null)}`
}

/** Test-only: drops the cache so specs cannot leak a config into each other. */
export function resetOrganizationConfigCache(): void {
  configCache.clear()
}

/**
 * Get organization config from Commerce Layer
 *
 */
export async function getOrganizationConfig(
  config: OrganizationConfig
): Promise<DefaultMfeConfig | null> {
  const key = configCacheKey(config)
  const cached = configCache.get(key)
  if (cached != null) return await cached

  const pending = fetchOrganizationConfig(config)
  configCache.set(key, pending)
  void pending.then(
    (result) => {
      if (result == null) configCache.delete(key)
    },
    () => {
      configCache.delete(key)
    }
  )
  return await pending
}

async function fetchOrganizationConfig(
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
