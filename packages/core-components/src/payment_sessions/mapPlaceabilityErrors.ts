import { extractApiErrors, fieldFromPointer } from "./apiErrors"
import type { PlaceabilityError } from "./types"

/**
 * Turn a 422 response from the `_placeable` trigger into one error per reason.
 *
 * The API answers a refused placement with a JSON:API `errors` array where each
 * entry points at the attribute that failed:
 *
 * ```json
 * { "code": "VALIDATION_ERROR",
 *   "detail": "Your order couldn't be placed because ...",
 *   "source": { "pointer": "/data/attributes/payment_action" },
 *   "meta": { "error": "..." } }
 * ```
 *
 * One error per reason, rather than one concatenated message, so a consumer can
 * address each individually instead of parsing prose. Populating `field` also
 * keeps the existing non-blocking-error filter working, which exempts coupon
 * and gift-card fields from blocking the place-order button.
 *
 * Be aware that *every* payment-rule failure — the order not being covered, a
 * payment setting not being allowed — arrives as `field: "payment_action"`.
 * They can only be told apart by their message.
 */
export function mapPlaceabilityErrors(error: unknown): PlaceabilityError[] {
  const errors = extractApiErrors(error)
  if (errors.length === 0) return []

  return errors.map((apiError) => ({
    code: apiError.code ?? "VALIDATION_ERROR",
    message: apiError.detail ?? apiError.title ?? "The order cannot be placed.",
    field: fieldFromPointer(apiError.source?.pointer),
    ...(apiError.meta?.error != null ? { meta: { error: apiError.meta.error } } : {}),
  }))
}
