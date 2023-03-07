interface TArgs {
  orderId: string
  accessToken: string
  slug: string
}
export default function getCartLink({
  orderId,
  accessToken,
  slug
}: TArgs): string {
  const env = process.env.NODE_ENV === 'production' ? '' : 'stg.'
  return `${slug}.${env}commercelayer.app/cart/${orderId}?accessToken=${accessToken}`
}
