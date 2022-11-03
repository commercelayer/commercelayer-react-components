import Parent from '#components-utils/Parent'
import PricesContext from '#context/PricesContext'
import { useState, useEffect, useContext } from 'react'
import { getPricesComponent } from '#utils/getPrices'
import { Price as PriceType } from '@commercelayer/sdk'
import { ChildrenFunction, LoaderType } from '#typings/index'
import SkuChildrenContext from '#context/SkuChildrenContext'

interface PriceChildrenProps extends Omit<PriceProps, 'children'> {
  loading: boolean
  loader: LoaderType
  prices: PriceType[]
}

export interface PriceProps
  extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<PriceChildrenProps>
  compareClassName?: string
  showCompare?: boolean
  skuCode?: string
}

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
  const sCode = pricesSkuCode || skuCode || (sku?.code as string)
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
