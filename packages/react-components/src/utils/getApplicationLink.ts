type ApplicationType = "checkout" | "cart" | "my-account" | "identity"

type ApplicationTypeProps<T extends ApplicationType = ApplicationType> = T extends "my-account"
  ? {
      applicationType: T
      orderId?: string
      modeType?: "login" | "signup"
      clientId?: string
      scope?: string
      returnUrl?: string
      resetPasswordUrl?: string
    }
  : T extends "identity"
    ? {
        applicationType: T
        orderId?: string
        modeType: "login" | "signup"
        clientId: string
        scope: string
        returnUrl: string
        resetPasswordUrl?: string
      }
    : {
        applicationType: Omit<T, "my-account" | "identity">
        orderId: string
        modeType?: "login" | "signup"
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
  customDomain,
}: Props): string {
  const env = domain === "commercelayer.io" ? "" : "stg."
  const t = applicationType === "identity" ? (modeType === "login" ? "" : "signup") : ""
  const domainName = customDomain ?? `${slug}.${env}commercelayer.app`
  const application = customDomain ? "" : `/${applicationType.toString()}`
  const path = orderId ?? t ?? ""

  // Use URLSearchParams to ensure all values are properly encoded,
  // preventing query-string injection via special characters in user-supplied inputs.
  const params = new URLSearchParams({ accessToken })

  if (applicationType === "identity") {
    if (clientId) params.set("clientId", clientId)
    if (scope) params.set("scope", scope)
    if (returnUrl) params.set("returnUrl", returnUrl)
    if (resetPasswordUrl) params.set("resetPasswordUrl", resetPasswordUrl)
  } else if (applicationType === "my-account") {
    if (returnUrl) params.set("returnUrl", returnUrl)
  }

  return `https://${domainName}${application}/${path}?${params.toString()}`
}
