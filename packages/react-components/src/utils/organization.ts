import { useState, useEffect } from 'react'
import { getDomain } from './getDomain'
import getSdk from './getSdk'
import {
  type DefaultMfeConfig,
  getMfeConfig
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
  params: Parameters<typeof getMfeConfig>[0]['params']
}

/**
 * Get organization config from Commerce Layer
 *
 */
export async function getOrganizationConfig(
  config: OrganizationConfig
): Promise<DefaultMfeConfig | null> {
  const { market } = jwt(config.accessToken)
  const sdk = getSdk(config)
  const organization = await sdk.organization.retrieve({
    fields: {
      organizations: ['id', 'config']
    }
  })
  return getMfeConfig({
    jsonConfig: organization.config ?? {},
    market: `market:id:${market.id.join(',')}`,
    params: config.params
  })
}

export function useOrganizationConfig({
  accessToken,
  endpoint,
  params
}: Partial<OrganizationConfig>): DefaultMfeConfig | null {
  const [organizationConfig, setOrganizationConfig] =
    useState<DefaultMfeConfig | null>(null)
  useEffect(() => {
    if (accessToken == null || endpoint == null) return
    getOrganizationConfig({
      accessToken,
      endpoint,
      params
    }).then((config) => {
      setOrganizationConfig(config)
    })
  }, [accessToken, endpoint])
  return organizationConfig
}
