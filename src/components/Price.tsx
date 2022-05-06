import React, {
  Fragment,
  useState,
  useEffect,
  useContext,
  FunctionComponent,
} from 'react'
import { isEmpty, has, indexOf } from 'lodash'
import Parent from './utils/Parent'
import PricesContext from '#context/PricesContext'
import { getPricesComponent } from '#utils/getPrices'
import { Price as PriceType } from '@commercelayer/sdk'
import components from '#config/components'
import { FunctionChildren, LoaderType } from '#typings/index'
import SkuChildrenContext from '#context/SkuChildrenContext'

const propTypes = components.Price.propTypes
const defaultProps = components.Price.defaultProps
const displayName = components.Price.displayName

type PriceChildrenProps = FunctionChildren<
  {
    loading: boolean
    loader: LoaderType
    prices: PriceType[]
  } & Omit<PriceProps, 'children'>
>

export interface PriceProps extends Partial<JSX.IntrinsicElements['span']> {
  children?: PriceChildrenProps
  compareClassName?: string
  showCompare?: boolean
  skuCode?: string
}

const Price: FunctionComponent<PriceProps> = (props) => {
  const { children, skuCode = '' } = props
  const {
    prices,
    skuCode: pricesSkuCode,
    loading,
    skuCodes,
    setSkuCodes,
    loader,
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
        setSkuCodes && setSkuCodes(skuCodes)
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
    ...props,
  }
  const pricesComponent =
    isEmpty(prices) || isEmpty(skuPrices)
      ? null
      : getPricesComponent(skuPrices, props)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      {loading || isEmpty(pricesComponent) ? loader : pricesComponent}
    </Fragment>
  )
}

Price.propTypes = propTypes
Price.defaultProps = defaultProps
Price.displayName = displayName

export default Price
