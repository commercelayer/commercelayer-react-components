import React, {
  useState,
  useEffect,
  ReactElement,
  FunctionComponent
} from 'react'
import { Sku } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import getPrices from '../utils/getPrices'
import getChildrenProp from '../utils/getChildrenProp'
import _ from 'lodash'

export interface PriceContainerProps {
  children: ReactElement
  accessToken?: string
  skuCode?: string
  currentSkuCode?: string
}

// TODO: refactor with useReducer
const PriceContainer: FunctionComponent<PriceContainerProps> = ({
  children,
  skuCode,
  ...props
}) => {
  const { currentSkuCode } = props
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState({})
  const skuCodes = getChildrenProp(children, 'skuCode')
  if (_.indexOf(skuCodes, skuCode) === -1 && skuCode) skuCodes.push(skuCode)
  if (_.indexOf(skuCodes, currentSkuCode) === -1 && currentSkuCode)
    skuCodes.push(currentSkuCode)
  const parentProps = {
    loading,
    prices,
    skuCode: currentSkuCode || skuCode,
    ...props
  }
  useEffect(() => {
    setLoading(true)
    if (skuCodes.length >= 1 && props.accessToken) {
      Sku.where({ codeIn: skuCodes.join(',') })
        .includes('prices')
        .perPage(25)
        .all()
        .then(r => {
          const pricesObj = getPrices(r.toArray())
          setPrices(pricesObj)
          setLoading(false)
        })
    }
    return () => {
      setPrices({})
    }
  }, [props.accessToken, currentSkuCode])

  return <Parent {...parentProps}>{children}</Parent>
}

export default PriceContainer
