import React, {
  useState,
  useEffect,
  FunctionComponent,
  useContext,
  ReactNode,
  useReducer
} from 'react'
import { Sku } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import getPrices from '../utils/getPrices'
import getChildrenProp from '../utils/getChildrenProp'
import _ from 'lodash'
import CommerceLayerContext from './context/CommerceLayerContext'
import VariantContext from './context/VariantContext'
import priceReducer from '../reducers/PriceReducer'
import { priceInitialState } from '../reducers/PriceReducer'
import PriceContext from './context/PriceContext'

export interface PriceContainerProps {
  children: ReactNode
  accessToken?: string
  skuCode?: string
}

const PriceContainer: FunctionComponent<PriceContainerProps> = ({
  children,
  skuCode,
  ...props
}) => {
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const skuCodes = getChildrenProp(children, 'skuCode')
  const { accessToken } = useContext(CommerceLayerContext)
  const { currentSkuCode } = useContext(VariantContext)
  if (_.indexOf(skuCodes, skuCode) === -1 && skuCode) skuCodes.push(skuCode)
  if (_.indexOf(skuCodes, currentSkuCode) === -1 && currentSkuCode)
    skuCodes.push(currentSkuCode)

  useEffect(() => {
    dispatch({
      type: 'setLoading',
      payload: true
    })
    if (skuCodes.length >= 1 && accessToken) {
      Sku.where({ codeIn: skuCodes.join(',') })
        .includes('prices')
        .perPage(25)
        .all()
        .then(r => {
          const pricesObj = getPrices(r.toArray())
          dispatch({
            type: 'setPrices',
            payload: pricesObj
          })
          dispatch({
            type: 'setLoading',
            payload: false
          })
        })
    }
    return () => {
      dispatch({
        type: 'setPrices',
        payload: {}
      })
      dispatch({
        type: 'setLoading',
        payload: false
      })
    }
  }, [accessToken, currentSkuCode])
  const priceObj = {
    loading: state.loading,
    prices: state.prices,
    skuCode: currentSkuCode || skuCode
  }
  return (
    <PriceContext.Provider value={priceObj}>{children}</PriceContext.Provider>
  )
}

export default PriceContainer
