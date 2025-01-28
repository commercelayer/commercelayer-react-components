import Parent from '#components/utils/Parent'
import PricesContext from '#context/PricesContext'
import { useState, useEffect, useContext, type JSX } from 'react';
import { getPricesComponent } from '#utils/getPrices'
import type { Price as PriceType } from '@commercelayer/sdk'
import type { ChildrenFunction, LoaderType } from '#typings/index'
import SkuChildrenContext from '#context/SkuChildrenContext'

interface PriceChildrenProps extends Omit<PriceProps, 'children'> {
  loading: boolean
  loader: LoaderType
  prices: PriceType[]
}

export interface PriceProps
  extends Omit<JSX.IntrinsicElements['span'], 'children' | 'ref'> {
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
}

/**
 * To display the price of your products with localized currency, discounts, and personalization rules, as shown in the code snippets below.
 *
 * Each price has an amount (the actual selling price) and an optional compare-at amount (the full price that you want to display to the customer — typically with a strikethrough).
 * This component is the owner of the price information. It fetches the price of the specified SKU and dispatches it to the cl-price-amount children.
 * <span type='info'>
 * By default it shows the `formatted_amount` and `formatted_compare_at_amount` of the first price object, but it also allows to access to the full `Price`object via children props.
 * </span>
 */
export function Price(props: PriceProps): JSX.Element {
  const { children, skuCode = '' } = props
  const {
    prices,
    skuCode: pricesSkuCode,
    loading,
    skuCodes,
    setSkuCodes,
    loader
  } = useContext(PricesContext)
  const { sku } = useContext(SkuChildrenContext)
  const [skuPrices, setSkuPrices] = useState<PriceType[]>([])
  const sCode = pricesSkuCode || skuCode || sku?.code || ''
  useEffect(() => {
    if (prices != null && `${sCode}` in prices) {
      setSkuPrices(prices[sCode] as PriceType[])
    } else {
      if (sCode && !skuCodes.includes(sCode)) {
        skuCodes.push(sCode)
        if (setSkuCodes) setSkuCodes({ skuCodes })
      }
    }
    return (): void => {
      setSkuPrices([])
    }
  }, [prices, sCode])
  const parentProps = {
    loading,
    loader,
    prices: skuPrices,
    ...props
  }
  const pricesComponent =
    prices == null || skuPrices == null
      ? null
      : getPricesComponent(skuPrices, props)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <>{loading || pricesComponent == null ? loader : pricesComponent}</>
  )
}

export default Price
