import React, {
  Fragment,
  useState,
  useEffect,
  useContext,
  FunctionComponent,
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'
import PricesContext from '@context/PricesContext'
import { getPricesComponent } from '@utils/getPrices'
import { PriceCollection } from '@commercelayer/js-sdk'
import components from '@config/components'
import { FunctionChildren, LoaderType } from '@typings/index'

const propTypes = components.Price.propTypes
const defaultProps = components.Price.defaultProps
const displayName = components.Price.displayName

type PriceChildrenProps = FunctionChildren<
  {
    loading: boolean
    loader: LoaderType
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
  const [skuPrices, setSkuPrices] = useState<PriceCollection[]>([])
  const sCode = pricesSkuCode || skuCode
  useEffect(() => {
    if (!_.isEmpty(prices) && _.has(prices, `${sCode}`)) {
      setSkuPrices(prices[sCode])
    } else {
      if (sCode && _.indexOf(skuCodes, sCode) === -1) {
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
    ...props,
  }
  const pricesComponent =
    _.isEmpty(prices) || _.isEmpty(skuPrices)
      ? null
      : getPricesComponent(skuPrices, props)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      {loading || _.isEmpty(pricesComponent) ? loader : pricesComponent}
    </Fragment>
  )
}

Price.propTypes = propTypes
Price.defaultProps = defaultProps
Price.displayName = displayName

export default Price
