import React, {
  Fragment,
  useState,
  useEffect,
  useContext,
  FunctionComponent,
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'
import PriceContext from '../context/PriceContext'
import { getPricesComponent } from '../utils/getPrices'
import { PriceCollection } from '@commercelayer/js-sdk'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.Price.propTypes
const defaultProps = components.Price.defaultProps
const displayName = components.Price.displayName

export type PPropsType = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const Price: FunctionComponent<PPropsType> = (props) => {
  const { children } = props
  const {
    prices,
    skuCode,
    loading,
    skuCodes,
    setSkuCodes,
    loader,
  } = useContext(PriceContext)
  const [skuPrices, setSkuPrices] = useState<PriceCollection[]>([])
  const sCode = skuCode || (props.skuCode as string)
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
  const pricesComponent = getPricesComponent(skuPrices, props)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      {loading || _.isEmpty(prices) || _.isEmpty(skuPrices)
        ? loader
        : pricesComponent}
    </Fragment>
  )
}

Price.propTypes = propTypes
Price.defaultProps = defaultProps
Price.displayName = displayName

export default Price
