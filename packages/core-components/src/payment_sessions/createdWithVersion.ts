import type { ApiVersion, Order } from "@commercelayer/sdk"

/**
 * The API version the order was created with.
 *
 * Core API sends it as the resource's `meta.created_with_version`, which the
 * SDK drops when it normalizes a response, so for now it is read from wherever
 * a newer SDK will put it: flattened among the attributes, or under `meta`.
 * Undefined until then, and for any order that comes back without it.
 */
function readCreatedWithVersion(order?: Order | null): string | undefined {
  const source = order as
    | { created_with_version?: unknown; meta?: { created_with_version?: unknown } }
    | null
    | undefined
  const version = source?.created_with_version ?? source?.meta?.created_with_version
  return typeof version === "string" && version !== "" ? version : undefined
}

/**
 * Whether the order was created with exactly this API version, e.g. `2026-05`.
 *
 * It matters because Core API fixes some of an order's behaviour once, at
 * creation, whatever version later requests use: an order created with
 * `2026-05` is on the payment engine where the older order-level gift card is
 * neither validated nor applied, and one created with `2017-08` keeps it even
 * when read with `2026-05`.
 *
 * `version` is one the SDK supports, so a mistyped one fails to compile rather
 * than silently never matching.
 *
 * Undefined when the order does not say which version created it, so callers
 * can keep deciding the way they did before it was available.
 */
export function isCreatedWithVersion(
  order: Order | null | undefined,
  version: ApiVersion
): boolean | undefined {
  const createdWith = readCreatedWithVersion(order)
  if (createdWith == null) return undefined
  return createdWith === version
}
