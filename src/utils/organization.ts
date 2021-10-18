type ReturnObj = {
  organization: string
  domain: string
}

export default function getOrganizationSlug<E extends string>(
  endpoint: E
): ReturnObj {
  const org = {
    organization: '',
    domain: 'commercelayer.io',
  }
  if (endpoint.search('commercelayer.io') === -1)
    org.domain = 'commercelayer.co'
  org.organization = endpoint
    .replace('https://', '')
    .replace(`.${org.domain}`, '')
  return org
}
