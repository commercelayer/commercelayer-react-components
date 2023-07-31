type ApplicationType = 'checkout' | 'cart' | 'my-account'

type ApplicationTypeProps =
  | {
      applicationType: 'my-account'
      orderId?: string
    }
  | {
      applicationType: Omit<ApplicationType, 'my-account'>
      orderId: string
    }

interface TArgs {
  accessToken: string
  slug: string
  domain: string
}

type Props = TArgs & ApplicationTypeProps

export function getApplicationLink({
  orderId,
  accessToken,
  slug,
  domain,
  applicationType
}: Props): string {
  const env = domain === 'commercelayer.io' ? '' : 'stg.'
  return `https://${slug}.${env}commercelayer.app/${applicationType.toString()}/${
    orderId ?? ''
  }?accessToken=${accessToken}`
}
