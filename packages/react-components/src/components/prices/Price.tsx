import { usePrices } from "@commercelayer/hooks"
import type { Price as PriceType } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import PricesContext from "#context/PricesContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import type { ChildrenFunction, LoaderType } from "#typings/index"
import { getPricesComponent } from "#utils/getPrices"

interface PriceChildrenProps extends Omit<PriceProps, "children"> {
  loading: boolean
  loader: LoaderType
  prices: PriceType[]
}

export interface PriceProps
  extends Omit<JSX.IntrinsicElements["span"], "children" | "ref"> {
  children?: ChildrenFunction<PriceChildrenProps>
  /**
   * CSS class name to be added for the compare price
   */
  compareClassName?: string
  /**
   * When `false` the compare_at price will not be displayed
   * @default true
   */
  showCompare?: boolean
  /**
   * The `sku_code` of the price to be fetched
   */
  skuCode?: string | null
  /**
   * Loader shown while fetching in standalone mode (no parent `PricesContainer`).
   * @default 'Loading...'
   */
  loader?: LoaderType
}

/**
 * Displays the price of a product with localized currency, discounts, and personalization rules.
 *
 * Can be used standalone — it automatically fetches and batches prices without a `PricesContainer` parent.
 * Multiple sibling `<Price>` components are automatically batched into a single API request via
 * the `usePrices` hook's built-in module-level debounce store.
 * <span type='info'>
 * By default it shows the `formatted_amount` and `formatted_compare_at_amount` of the first price object,
 * but it also allows access to the full `Price` object via children props.
 * </span>
 */
export function Price(props: PriceProps): JSX.Element {
  const { children, skuCode = "", loader: propLoader } = props

  // Container context (from PricesContainer)
  const {
    prices: contextPrices,
    skuCode: pricesSkuCode,
    loading: contextLoading,
    skuCodes,
    setSkuCodes,
    loader: contextLoader,
  } = useContext(PricesContext)

  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const { sku } = useContext(SkuChildrenContext)
  const [skuPrices, setSkuPrices] = useState<PriceType[]>([])

  // setSkuCodes is undefined when no PricesContainer is present → standalone mode
  const isStandalone = setSkuCodes == null
  const sCode = pricesSkuCode || skuCode || sku?.code || ""
  const loader = propLoader ?? contextLoader ?? "Loading..."

  // Standalone batching: delegate entirely to usePrices hook.
  // The hook uses a module-level store + useSyncExternalStore so all sibling
  // <Price> instances share one debounced fetch → one SWR-deduplicated request.
  const {
    prices: batchPrices,
    isLoading: batchLoading,
    registerSku,
    unregisterSku,
  } = usePrices(isStandalone ? (accessToken ?? "") : "", isStandalone ? interceptors : undefined)

  // Standalone: register/unregister this SKU
  useEffect(() => {
    if (!isStandalone || !sCode) return
    registerSku(sCode)
    return () => unregisterSku(sCode)
  }, [isStandalone, sCode, registerSku, unregisterSku])

  // Standalone: sync prices for this specific SKU from the shared batch result
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-run when prices or code changes
  useEffect(() => {
    if (!isStandalone) return
    setSkuPrices(batchPrices.filter((p) => p.sku_code === sCode))
    return () => setSkuPrices([])
  }, [isStandalone, batchPrices, sCode])

  // Container mode: existing registration + sync logic
  // biome-ignore lint/correctness/useExhaustiveDependencies: skuCodes intentionally omitted — the !includes check prevents re-registration loops
  useEffect(() => {
    if (isStandalone) return
    if (contextPrices != null && `${sCode}` in contextPrices) {
      setSkuPrices(contextPrices[sCode] as PriceType[])
    } else {
      if (sCode && !skuCodes.includes(sCode)) {
        setSkuCodes({ skuCodes: [...skuCodes, sCode] })
      }
    }
    return () => setSkuPrices([])
  }, [isStandalone, contextPrices, sCode])

  const loading = isStandalone ? batchLoading : contextLoading

  const parentProps = { loading, loader, prices: skuPrices, ...props }

  const pricesComponent =
    // c8 ignore next — skuPrices is always initialized (never null)
    skuPrices == null ? null : getPricesComponent(skuPrices, props)

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : loading || pricesComponent == null ? (
    <>{loader}</>
  ) : (
    <>{pricesComponent}</>
  )
}

export default Price
