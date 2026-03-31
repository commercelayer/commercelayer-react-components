import { getOrganizationSlug } from './organization'
import { CommerceLayer as Sdk } from '@commercelayer/sdk/bundle'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'

export default function getSdk({
  endpoint,
  accessToken
}: CommerceLayerConfig): ReturnType<typeof Sdk> {
  if (accessToken == null || endpoint == null)
    throw new Error('accessToken and endpoint are required parameters')
  const org = getOrganizationSlug(endpoint)
  return Sdk({
    accessToken,
    ...org
  })
}
