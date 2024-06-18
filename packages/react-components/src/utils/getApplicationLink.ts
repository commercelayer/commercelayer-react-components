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
        resetPasswordUrl?: string
      }
    : T extends 'identity'
      ? {
          applicationType: T
          orderId?: string
          modeType: 'login' | 'signup'
          clientId: string
          scope: string
          returnUrl: string
          resetPasswordUrl?: string
        }
      : {
          applicationType: Omit<T, 'my-account' | 'identity'>
          orderId: string
          modeType?: 'login' | 'signup'
          clientId?: string
          scope?: string
          returnUrl?: string
          resetPasswordUrl?: string
        }

interface TArgs {
  accessToken: string
  slug: string
  domain: string
  customDomain?: string
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
  returnUrl,
  resetPasswordUrl,
  customDomain
}: Props): string {
  const env = domain === 'commercelayer.io' ? '' : 'stg.'
  const t =
    applicationType === 'identity' ? (modeType === 'login' ? '' : 'signup') : ''
  const c = clientId ? `&clientId=${clientId}` : ''
  const s = scope ? `&scope=${scope}` : ''
  const r = returnUrl ? `&returnUrl=${returnUrl}` : ''
  const p = resetPasswordUrl ? `&resetPasswordUrl=${resetPasswordUrl}` : ''
  const params = applicationType === 'identity' ? `${c}${s}${r}${p}` : ''
  const domainName = customDomain ?? `${slug}.${env}commercelayer.app`
  const application = customDomain ? '' : `/${applicationType.toString()}`
  return `https://${domainName}${application}/${
    orderId ?? t ?? ''
  }?accessToken=${accessToken}${params}`
}
