interface TArgs {
  orderId: string
  accessToken: string
  slug: string
  domain: string
}
export default function getCartLink({
  orderId,
  accessToken,
  slug,
  domain
}: TArgs): string {
  const env = domain === 'commercelayer.io' ? '' : 'stg.'
  return `https://${slug}.${env}commercelayer.app/cart/${orderId}?accessToken=${accessToken}`
}
