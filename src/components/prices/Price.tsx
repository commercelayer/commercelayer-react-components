import Parent from '#components-utils/Parent'
import PricesContext from '#context/PricesContext'
import { useState, useEffect, useContext } from 'react'
import { isEmpty, has, indexOf } from 'lodash'
import { getPricesComponent } from '#utils/getPrices'
import { Price as PriceType } from '@commercelayer/sdk'
import { FunctionChildren, LoaderType } from '#typings/index'
import SkuChildrenContext from '#context/SkuChildrenContext'

type PriceChildrenProps = FunctionChildren<
  {
    loading: boolean
    loader: LoaderType
    prices: PriceType[]
  } & Omit<PriceProps, 'children'>
>

export type PriceProps = Partial<JSX.IntrinsicElements['span']> & {
  children?: PriceChildrenProps
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
    if (!isEmpty(prices) && has(prices, `${sCode}`)) {
      setSkuPrices(prices[sCode] as PriceType[])
    } else {
      if (sCode && indexOf(skuCodes, sCode) === -1) {
        skuCodes.push(sCode)
        if (setSkuCodes) setSkuCodes(skuCodes)
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
    isEmpty(prices) || isEmpty(skuPrices)
      ? null
      : getPricesComponent(skuPrices, props)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <>{loading || isEmpty(pricesComponent) ? loader : pricesComponent}</>
  )
}

export default Price
