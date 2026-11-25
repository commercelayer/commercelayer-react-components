import { extractApiErrors } from "./apiErrors"
import type { PlaceabilityError } from "./types"

/** The attribute a gift card failure is reported against. */
const GIFT_CARD_FIELD = "gift_card_code"

/**
 * Turn a refused gift card operation into errors worth showing a shopper.
 *
 * **Why not just `error.message`.** On an SDK error that is the empty string —
 * the API's wording lives only in the JSON:API `errors` array — so reading it
 * renders an error box with nothing in it, which is barely better than the
 * silence it replaced.
 *
 * **Why `title` and not `detail`.** The API sends both, and `detail` is
 * `title` prefixed with the attribute name: `"gift_card_code - doesn't match
 * any active gift card"`. The prefix is for an API client, not a shopper.
 * (`mapPlaceabilityErrors` prefers `detail` because there the two are the same
 * text and `detail` is the fuller one.)
 *
 * **Why the other entries are dropped.** A refused gift card comes back as
 * *two* errors: the real one, and `"token - can't be blank"` — a consequence of
 * the session never being built, not something the shopper did. Showing it
 * would be actively misleading. Everything is kept when nothing points at
 * `gift_card_code`, so an unrecognised failure is still reported rather than
 * swallowed.
 *
 * The API collapses four causes — unknown code, expired, empty, bound to
 * another market — into one message, so `meta.error` (`"invalid_gift_card"`) is
 * as specific as this gets.
 */
export function mapGiftCardErrors(error: unknown): PlaceabilityError[] {
  const errors = extractApiErrors(error)
  if (errors.length === 0) return []

  const giftCardErrors = errors.filter((apiError) =>
    apiError.source?.pointer?.endsWith(`/${GIFT_CARD_FIELD}`)
  )
  const relevant = giftCardErrors.length > 0 ? giftCardErrors : errors

  return relevant.map((apiError) => ({
    code: apiError.code ?? "VALIDATION_ERROR",
    message:
      apiError.title ?? apiError.detail ?? "This gift card code could not be applied to the order.",
    field: GIFT_CARD_FIELD,
    ...(apiError.meta?.error != null ? { meta: { error: apiError.meta.error } } : {}),
  }))
}
