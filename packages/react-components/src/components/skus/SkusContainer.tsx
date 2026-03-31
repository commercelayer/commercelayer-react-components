import { useSkus } from "@commercelayer/hooks"
import type { QueryParamsList } from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useMemo } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuContext from "#context/SkuContext"

interface Props {
  /**
   * An array of skus to display.
   */
  skus: string[]
  /**
   * Accept a React node and [Skus](./Skus.d.ts) component as children to display above the skus.
   */
  children: ReactNode
  /**
   * An object params to query the skus resource
   */
  queryParams?: QueryParamsList
}

/**
 * Main container for the SKUs components.
 * It stores - in its context - the details for each `sku` defined in the `skus` prop array.
 *
 * It also accept a `queryParams` prop to refine pagination, sorting, filtering and includes for the fetch request.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<Skus>`
 * </span>
 */
export function SkusContainer<P extends Props>(props: P): JSX.Element {
  const { skus, children, queryParams } = props
  const config = useContext(CommerceLayerContext)
  const {
    skus: skuList,
    isLoading,
    fetchSkus,
    clearSkus,
  } = useSkus(config.accessToken ?? "")

  useEffect(() => {
    if (config.accessToken != null && skus.length > 0) {
      fetchSkus({
        ...queryParams,
        filters: { ...queryParams?.filters, code_in: skus.join(",") },
      })
    }
    return () => {
      clearSkus()
    }
  }, [config.accessToken, skus, queryParams, fetchSkus, clearSkus])

  const contextValue = useMemo(
    () => ({ skus: skuList, loading: isLoading, skuCodes: skus }),
    [skuList, isLoading, skus],
  )

  return (
    <SkuContext.Provider value={contextValue}>{children}</SkuContext.Provider>
  )
}

export default SkusContainer
