/** Shape of a JSON:API error object as the API sends it. */
export interface ApiErrorObject {
  code?: string
  title?: string
  detail?: string
  source?: { pointer?: string }
  meta?: { error?: string }
}

/**
 * The SDK surfaces API errors as a thrown object, but the exact wrapper has
 * moved between versions, so probe the two shapes rather than assuming one.
 *
 * Note what is *not* here: `error.message`. On an SDK error that is empty — the
 * API's wording only ever lives in this array — so anything reading `message`
 * shows the shopper a blank.
 */
export function extractApiErrors(error: unknown): ApiErrorObject[] {
  if (error == null || typeof error !== "object") return []
  const candidate = error as { errors?: unknown; response?: { data?: { errors?: unknown } } }
  const errors = candidate.errors ?? candidate.response?.data?.errors
  return Array.isArray(errors) ? (errors as ApiErrorObject[]) : []
}

/**
 * `/data/attributes/payment_action` → `payment_action`.
 * `/data` (a base error, not tied to an attribute) → `base`.
 */
export function fieldFromPointer(pointer?: string): string | undefined {
  if (pointer == null || pointer === "") return undefined
  const last = pointer.split("/").pop()
  if (last == null || last === "") return undefined
  return last === "data" ? "base" : last
}
