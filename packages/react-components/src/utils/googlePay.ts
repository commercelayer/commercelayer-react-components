/**
 * Google Pay's browser API, loaded from Google's `pay.js`.
 *
 * Google serves it from its own domain only — there is no package to bundle —
 * so it is injected once per page and shared. A page that already has it,
 * because another integration loaded it, is not given a second copy.
 */

const GOOGLE_PAY_SCRIPT = "https://pay.google.com/gp/p/js/pay.js"

type GooglePaymentsApi = typeof google.payments.api

/** Google's API, if `pay.js` has run on this page. Looked up when needed, as Apple's globals are. */
export function googlePaymentsApi(): GooglePaymentsApi | undefined {
  return (globalThis as { google?: typeof google }).google?.payments?.api
}

let loading: Promise<GooglePaymentsApi> | null = null

/**
 * Google's API, loading `pay.js` the first time it is asked for. A load that
 * fails is forgotten, so the next caller tries again.
 */
export function loadGooglePaymentsApi(): Promise<GooglePaymentsApi> {
  const loaded = googlePaymentsApi()
  if (loaded != null) return Promise.resolve(loaded)
  if (loading == null) {
    const current = new Promise<GooglePaymentsApi>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = GOOGLE_PAY_SCRIPT
      script.async = true
      script.onload = () => {
        const api = googlePaymentsApi()
        if (api != null) resolve(api)
        else reject(new Error("pay.js loaded without Google Pay's API"))
      }
      script.onerror = () => {
        script.remove()
        reject(new Error("pay.js could not be loaded"))
      }
      document.head.appendChild(script)
    })
    loading = current
    current.catch(() => {
      if (loading === current) loading = null
    })
  }
  return loading
}

/** Forget a load under way. For tests, which share the module. */
export function resetGooglePaymentsApi(): void {
  loading = null
}
