type ApplicationType = 'checkout' | 'cart' | 'my-account' | 'identity'

type ApplicationTypeProps<T extends ApplicationType = ApplicationType> =
  T extends 'my-account'
    ? {
        applicationType: T
        orderId?: string
        modeType?: 'login' | 'signup'
        clientId?: string
        scope?: string
        returnUrl?: string
      }
    : T extends 'identity'
    ? {
        applicationType: T
        orderId?: string
        modeType: 'login' | 'signup'
        clientId: string
        scope: string
        returnUrl: string
      }
    : {
        applicationType: Omit<T, 'my-account' | 'identity'>
        orderId: string
        modeType?: 'login' | 'signup'
        clientId?: string
        scope?: string
        returnUrl?: string
      }

interface TArgs {
  accessToken: string
  slug: string
  domain: string
}

type Props = ApplicationTypeProps & TArgs

export function getApplicationLink({
  orderId,
  accessToken,
  slug,
  domain,
  applicationType,
  modeType,
  clientId,
  scope,
  returnUrl
}: Props): string {
  const env = domain === 'commercelayer.io' ? '' : 'stg.'
  const t = modeType === 'login' ? '' : 'signup'
  const c = clientId ? `&clientId=${clientId}` : ''
  const s = scope ? `&scope=${scope}` : ''
  const r = returnUrl ? `&returnUrl=${returnUrl}` : ''
  const params = applicationType === 'identity' ? `${c}${s}${r}` : ''
  return `https://${slug}.${env}commercelayer.app/${applicationType.toString()}/${
    orderId ?? t ?? ''
  }?accessToken=${accessToken}${params}`
}
