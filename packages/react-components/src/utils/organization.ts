import { useState, useEffect } from 'react'
import { getDomain } from './getDomain'
import getSdk from './getSdk'
import {
  type DefaultConfig,
  getConfig
} from '@commercelayer/organization-config'
import { jwt } from './jwt'

interface ReturnObj {
  organization: string
  domain: string
}

export function getOrganizationSlug<E extends string>(endpoint: E): ReturnObj {
  const org = {
    organization: '',
    domain: 'commercelayer.io'
  }
  const { domain, slug } = getDomain(endpoint)
  return {
    organization: slug,
    domain: domain || org.domain
  }
}

export interface OrganizationConfig {
  accessToken: string
  endpoint: string
  params: Parameters<typeof getConfig>[0]['params']
}

/**
 * Get organization config from Commerce Layer
 *
 */
export async function getOrganizationConfig(
  config: OrganizationConfig
): Promise<DefaultConfig | null> {
  const { market } = jwt(config.accessToken)
  const sdk = getSdk(config)
  const organization = await sdk.organization.retrieve({
    fields: {
      organization: ['id', 'config']
    }
  })
  return getConfig({
    jsonConfig: organization.config ?? {},
    market: `market:id:${market.id.join(',')}`,
    params: config.params
  })
}

export function useOrganizationConfig({
  accessToken,
  endpoint,
  params
}: Partial<OrganizationConfig>): DefaultConfig | null {
  const [organizationConfig, setOrganizationConfig] =
    useState<DefaultConfig | null>(null)
  useEffect(() => {
    if (accessToken == null || endpoint == null) return
    void getOrganizationConfig({
      accessToken,
      endpoint,
      params
    }).then((config) => {
      setOrganizationConfig(config)
    })
  }, [accessToken, endpoint])
  return organizationConfig
}
