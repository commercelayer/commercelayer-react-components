import { usePrices } from "@commercelayer/hooks"
import type { QueryPageSize } from "@commercelayer/sdk"
import {
  type JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import PricesContext, { type PricesContextValue } from "#context/PricesContext"
import SkuContext from "#context/SkuContext"
import type { LoaderType } from "#typings"
import getPricesMap from "#utils/getPrices"

interface Props {
  /**
   * Any valid JSX.Element(s).
   * A single `<Price>` component or a list of them is expected to render the prices.
   */
  children: JSX.Element | JSX.Element[]
  /**
   * SDK query filter to fetch the prices when multiple prices are requested.
   */
  filters?: object
  /**
   * Loader component or string to be rendered while the prices are being fetched.
   * @default 'Loading...'
   */
  loader?: LoaderType
  /**
   * Prices per page to be fetched
   */
  perPage?: QueryPageSize
  /**
   * SKU code to fetch the prices for. If not provided, the `sku_code` will be retrieved from the `<Price>` component(s) nested as children.
   */
  skuCode?: string
}

/**
 * Main container for the Prices components. It stores the prices context.
 *
 * It can be used to fetch the prices for a specific `sku_code` passed as prop
 * or for the `sku_code` retrieved from all `<Price>` components nested as children.
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<Price>`
 * </span>
 */
export function PricesContainer({
  children,
  skuCode = "",
  loader = "Loading...",
  perPage = 10,
  filters = {},
}: Props): JSX.Element {
  const config = useContext(CommerceLayerContext)
  const { skuCodes: contextSkuCodes } = useContext(SkuContext)
  const [skuCodes, setSkuCodesState] = useState<string[]>(
    skuCode ? [skuCode] : [],
  )
  const {
    prices: pricesList,
    isLoading,
    fetchPrices,
    clearPrices,
  } = usePrices(config.accessToken ?? "", config.interceptors)

  const sCode =
    contextSkuCodes != null && contextSkuCodes.length > 0 ? "" : skuCode

  // Sync skuCodes from SkuContext (e.g. when used inside <SkusContainer>)
  useEffect(() => {
    if (contextSkuCodes != null && contextSkuCodes.length > 0) {
      setSkuCodesState(contextSkuCodes)
    }
  }, [contextSkuCodes])

  // Debounce timer ref — batches multiple Price children registrations into one API request
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stabilize filters reference to avoid infinite effect loops (default {} is a new object each render)
  const filtersKey = JSON.stringify(filters)
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPrices/clearPrices are stable; filtersKey stringifies filters for stable comparison
  useEffect(() => {
    const codes =
      contextSkuCodes != null && contextSkuCodes.length > 0
        ? contextSkuCodes
        : skuCodes
    if (config.accessToken != null && codes.length > 0) {
      if (fetchTimerRef.current != null) clearTimeout(fetchTimerRef.current)
      fetchTimerRef.current = setTimeout(() => {
        fetchPrices({
          filters: { sku_code_in: codes.join(","), ...filters },
          pageSize: perPage,
        })
      }, 50)
    }
    return () => {
      if (fetchTimerRef.current != null) clearTimeout(fetchTimerRef.current)
      clearPrices()
    }
  }, [config.accessToken, skuCodes, contextSkuCodes, filtersKey, perPage])

  const setSkuCodes = useCallback(
    ({ skuCodes: newCodes }: { skuCodes: string[] }) => {
      // Functional update so concurrent Price children don't overwrite each other
      setSkuCodesState((prev) => {
        const merged = Array.from(new Set([...prev, ...newCodes]))
        return merged.length === prev.length ? prev : merged
      })
    },
    [],
  )

  const pricesMap = useMemo(() => getPricesMap(pricesList), [pricesList])

  const contextValue = useMemo<PricesContextValue>(
    () => ({
      loading: isLoading,
      prices: pricesMap,
      skuCodes,
      errors: [],
      skuCode: sCode,
      loader,
      setSkuCodes,
    }),
    [isLoading, pricesMap, skuCodes, sCode, loader, setSkuCodes],
  )

  return (
    <PricesContext.Provider value={contextValue}>
      {children}
    </PricesContext.Provider>
  )
}

export default PricesContainer
