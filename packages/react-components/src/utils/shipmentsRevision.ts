/**
 * Which revision of an order the cached shipments for it were fetched at.
 *
 * `useShipments` caches on `(accessToken, orderId)` and never revalidates on its
 * own, and `<Shipments>` decides whether to refetch by comparing the order's
 * `updated_at` with what it last saw. That marker lives on the component, so a
 * step that closes and reopens starts again from nothing and accepts whatever
 * the cache holds — shipments fetched before the order moved on, still carrying
 * a shipping method the API has since cleared. This map outlives the component,
 * like the cache it mirrors.
 */
const revisions = new Map<string, string>()

export function getShipmentsRevision(orderId: string | undefined): string | undefined {
  return orderId == null ? undefined : revisions.get(orderId)
}

export function recordShipmentsRevision(
  orderId: string | undefined,
  updatedAt: string | undefined
): void {
  if (orderId == null || updatedAt == null) return
  revisions.set(orderId, updatedAt)
}

/** Test-only: the map is module state and would otherwise leak between tests. */
export function resetShipmentsRevisions(): void {
  revisions.clear()
}
