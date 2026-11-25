import type { CheckoutError } from "@checkout.com/checkout-web-components"
import type { BaseError } from "#typings/errors"
import type { PaymentGatewaySubmitResult } from "#utils/paymentGatewayStore"

/**
 * What a Checkout.com error means for the payment in flight.
 *
 * - **Submit:** the form was not complete. A stop, shown by the form itself.
 * - **Declined or aborted:** a verdict, so no money moved. The code is the
 *   decline reason Checkout.com gave, when it gave one.
 * - **Everything else** — a network failure, a request that failed midway —
 *   leaves the outcome unknown: the payment may have reached Checkout.com.
 */
export function checkoutComOutcome(error: CheckoutError): PaymentGatewaySubmitResult {
  if (error.type === "Submit") return { status: "incomplete" }
  if (error.type === "Request") {
    if (error.code === "payment_request_declined") {
      const [reason] = error.details.requestErrorCodes ?? []
      return { status: "failed", code: reason ?? error.code }
    }
    if (error.code === "payment_request_aborted") {
      return { status: "failed", code: error.details.abortReason ?? error.code }
    }
  }
  return { status: "unknown", code: error.code }
}

/**
 * Checkout.com's keys say which environment they belong to: `pk_sbox_` for the
 * sandbox, and `pk_test_` on accounts older than that convention.
 */
export function isSandboxKey(publicKey: string): boolean {
  return publicKey.startsWith("pk_sbox_") || publicKey.startsWith("pk_test_")
}

/**
 * A refusal carrying Checkout.com's own code, tagged `orders`: `<Errors>`
 * matches on `resource`, and the place-order button writes what it gets from
 * the handoff, in band or out of band, into the order's error state.
 */
export function checkoutComError(message: string | undefined, code: string): BaseError {
  return {
    code: "VALIDATION_ERROR",
    resource: "orders",
    message: message ?? "The payment was not completed.",
    meta: { error: code },
  }
}
