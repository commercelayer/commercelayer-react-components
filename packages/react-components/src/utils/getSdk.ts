import { getOrganizationSlug } from './organization'
import Sdk from '@commercelayer/sdk'
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
