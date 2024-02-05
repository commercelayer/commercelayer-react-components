export function getDomain(endpoint: string): { slug: string; domain: string } {
  const url = new URL(endpoint)
  const [slug] = url.hostname.split('.')
  const domain = url.hostname.replace(`${slug ?? ''}.`, '')
  return {
    domain,
    slug: slug ?? ''
  }
}
