import { getDomain } from './getDomain'

interface ReturnObj {
  organization: string
  domain: string
}

export default function getOrganizationSlug<E extends string>(
  endpoint: E
): ReturnObj {
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
