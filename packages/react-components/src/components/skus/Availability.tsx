import { useAvailability } from "@commercelayer/hooks"
import { type ReactNode, useContext, useEffect, useMemo } from "react"
import AvailabilityContext from "#context/AvailabilityContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import type { LoaderType } from "#typings/index"

export interface AvailabilityProps {
  children: ReactNode
  /** The SKU code to fetch availability for. */
  skuCode?: string
  /**
   * The SKU id. Takes precedence over `skuCode` and improves performance
   * by skipping the SKU lookup by code.
   */
  skuId?: string
  /** Callback called when the quantity is updated. */
  getQuantity?: (quantity: number) => void
  /** Loader shown while fetching availability data. */
  loader?: LoaderType
}

/**
 * Displays availability data for a SKU.
 *
 * Can be used standalone — automatically fetches availability without an
 * `AvailabilityContainer` parent. Also picks up `skuCode` from context when
 * nested inside `<Skus>` or a line item component.
 *
 * @example Standalone (preferred):
 * ```tsx
 * <CommerceLayer accessToken="...">
 *   <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
 *     <AvailabilityTemplate labels={{ available: "In stock" }} />
 *   </Availability>
 * </CommerceLayer>
 * ```
 */
export function Availability({
  children,
  skuCode,
  skuId,
  getQuantity,
  loader: propLoader = "Loading...",
}: AvailabilityProps): ReactNode {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { sku } = useContext(SkuChildrenContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const { availability, fetchAvailability, clearAvailability, isLoading } =
    useAvailability(accessToken ?? "", interceptors)

  const sCode = skuCode ?? lineItem?.sku_code ?? sku?.code

  useEffect(() => {
    if (
      accessToken != null &&
      accessToken !== "" &&
      (sCode != null || skuId != null)
    ) {
      fetchAvailability({ skuCode: sCode, skuId })
    }
    return () => {
      clearAvailability()
    }
  }, [accessToken, sCode, skuId, clearAvailability, fetchAvailability])

  useEffect(() => {
    if (getQuantity != null && availability?.quantity != null) {
      getQuantity(availability.quantity)
    }
  }, [availability?.quantity, getQuantity])

  const contextValue = useMemo(
    () => ({ ...availability, parent: true }),
    [availability],
  )

  const hasFetchTarget = sCode != null || skuId != null
  if (hasFetchTarget && isLoading) return propLoader

  return (
    <AvailabilityContext.Provider value={contextValue}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export default Availability
