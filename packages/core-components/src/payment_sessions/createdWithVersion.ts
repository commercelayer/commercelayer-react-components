import type { ApiVersion, Order } from "@commercelayer/sdk"

/**
 * Whether the order was created with exactly this API version, e.g. `2026-05`.
 *
 * It matters because Core API fixes some of an order's behaviour once, at
 * creation, whatever version later requests use: an order created with
 * `2026-05` is on the payment engine where the older order-level gift card is
 * neither validated nor applied, and one created with `2017-08` keeps it even
 * when read with `2026-05`.
 *
 * The version is the one the API reports in the order's `meta`. `version` is
 * one the SDK supports, so a mistyped one fails to compile rather than silently
 * never matching.
 *
 * Undefined when the order does not say which version created it — the API did
 * not report it, or the order was not fetched from the API — so callers can
 * keep deciding the way they would without it.
 */
export function isCreatedWithVersion(
  order: Order | null | undefined,
  version: ApiVersion
): boolean | undefined {
  const createdWith = order?.meta?.created_with_version
  if (createdWith == null || createdWith === "") return undefined
  return createdWith === version
}
