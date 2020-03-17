import React, {
  Fragment,
  useState,
  useEffect,
  useContext,
  FunctionComponent
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'
import PriceContext from '../context/PriceContext'
import PropTypes, { InferProps } from 'prop-types'
import { BC } from '../@types'
import { getPricesComponent } from '../utils/getPrices'

export const PriceProps = {
  ...BC,
  children: PropTypes.func,
  compareClassName: PropTypes.string,
  skuCode: PropTypes.string,
  showCompare: PropTypes.bool
}

export type PPropsType = InferProps<typeof PriceProps>

const Price: FunctionComponent<PPropsType> = props => {
  const { children } = props
  const {
    prices,
    skuCode,
    loading,
    skuCodes,
    setSkuCodes,
    loader
  } = useContext(PriceContext)
  const [skuPrices, setSkuPrices] = useState([])
  const sCode = skuCode || props.skuCode
  useEffect(() => {
    if (!_.isEmpty(prices) && prices[sCode]) {
      console.log('prices[sCode]', prices[sCode])
      setSkuPrices(prices[sCode])
    } else {
      if (sCode && _.indexOf(skuCodes, sCode) === -1) {
        skuCodes.push(sCode)
        setSkuCodes(skuCodes)
      }
    }
    return (): void => {
      setSkuPrices([])
    }
  }, [prices])
  const parentProps = {
    loading,
    loader,
    ...props
  }
  const pricesComponent = getPricesComponent(skuPrices, parentProps)
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>{pricesComponent}</Fragment>
  )
}

Price.propTypes = PriceProps

export default Price
