import { useSkus } from "@commercelayer/react-hooks-components"
import type { Sku as SkuType } from "@commercelayer/sdk"
import { type ReactNode, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import SkuContext from "#context/SkuContext"
import type { LoaderType } from "#typings/index"

export interface SkuProps {
  children?: ReactNode
  /** The SKU code to fetch in standalone mode */
  skuCode?: string | null
  /** Loader shown while fetching in standalone mode */
  loader?: LoaderType
}

/**
 * Displays SKU data for a product.
 *
 * Can be used standalone — automatically fetches and batches SKU data without a `SkusContainer` parent.
 * Multiple sibling `<Sku>` components are batched into a single API request via the module-level debounce store.
 *
 * @example Standalone (preferred):
 * ```tsx
 * <CommerceLayer accessToken="...">
 *   <Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
 *     <SkuField attribute="name" tagElement="h2" />
 *   </Sku>
 * </CommerceLayer>
 * ```
 */
export function Sku({ children, skuCode = "", loader: propLoader }: SkuProps): ReactNode {
  const { setSkuCodes } = useContext(SkuContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [currentSku, setCurrentSku] = useState<SkuType | undefined>(undefined)

  // setSkuCodes is undefined when no SkusContainer is present → standalone mode
  const isStandalone = setSkuCodes == null
  const sCode = skuCode ?? ""
  const loader = propLoader ?? "Loading..."

  const {
    skus: batchSkus,
    isLoading: batchLoading,
    registerSku,
    unregisterSku,
  } = useSkus(isStandalone ? (accessToken ?? "") : "", isStandalone ? interceptors : undefined)

  // Register/unregister this SKU code with the batch store
  useEffect(() => {
    if (!isStandalone || !sCode) return
    registerSku(sCode)
    return () => unregisterSku(sCode)
  }, [isStandalone, sCode, registerSku, unregisterSku])

  // Sync the matching SKU from batch results
  useEffect(() => {
    if (!isStandalone) return
    setCurrentSku(batchSkus.find((s) => s.code === sCode))
    return () => setCurrentSku(undefined)
  }, [isStandalone, batchSkus, sCode])

  if (isStandalone && (batchLoading || currentSku == null)) return loader

  return (
    <SkuChildrenContext.Provider value={{ sku: currentSku }}>
      {children}
    </SkuChildrenContext.Provider>
  )
}

export default Sku
