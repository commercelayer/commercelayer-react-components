import type { PayPalV6Namespace } from "@paypal/paypal-js/sdk-v6"
import { jwt } from "#utils/jwt"

/**
 * The global PayPal's SDK is loaded under.
 *
 * Not `paypal`, its default: the Adyen Drop-in loads PayPal's older SDK for its
 * own PayPal under that name, and Braintree's PayPal loads it under one of its
 * own. Two scripts writing one global leave whichever loaded last driving both.
 */
const PAYPAL_NAMESPACE = "commercelayerPayPal"

let coreSdk: { environment: string; promise: Promise<PayPalV6Namespace | null> } | null = null

/**
 * Load PayPal's core script once per page and environment.
 *
 * The package is imported at run time, so it stays out of every checkout that
 * never offers PayPal, and the script it injects is shared by every button.
 */
export function loadPayPal(
  environment: "sandbox" | "production"
): Promise<PayPalV6Namespace | null> {
  if (coreSdk == null || coreSdk.environment !== environment) {
    const promise = import("@paypal/paypal-js/sdk-v6").then(({ loadCoreSdkScript }) =>
      loadCoreSdkScript({ environment, dataNamespace: PAYPAL_NAMESPACE })
    )
    coreSdk = { environment, promise }
    // A script that failed to load is not cached: the next button tries again.
    promise.catch(() => {
      if (coreSdk?.promise === promise) coreSdk = null
    })
  }
  return coreSdk.promise
}

/** Forget the loaded script. For tests, which share the module. */
export function resetPayPalSdk(): void {
  coreSdk = null
}

/**
 * Which PayPal the SDK talks to: the sandbox for a test organization,
 * production for a live one — the same choice Commerce Layer makes when it
 * creates the PayPal order, so the button and the order are in one world. The
 * access token's `test` claim is that flag. A token that cannot be read is
 * taken as a test one, where a mistake costs nothing.
 */
export function environmentOf(accessToken?: string): "sandbox" | "production" {
  if (accessToken == null) return "sandbox"
  try {
    return jwt(accessToken).test === false ? "production" : "sandbox"
  } catch {
    return "sandbox"
  }
}
