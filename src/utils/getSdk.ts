import getOrganizationSlug from './organization'
import Sdk from '@commercelayer/sdk'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'

export default function getSdk({
  endpoint,
  accessToken
}: CommerceLayerConfig): ReturnType<typeof Sdk> {
  const org = getOrganizationSlug(endpoint)
  return Sdk({
    accessToken,
    ...org
  })
}
