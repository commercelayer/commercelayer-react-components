import React, {
  useEffect,
  FunctionComponent,
  useContext,
  ReactNode,
  useReducer
} from 'react'
import { Sku } from '@commercelayer/js-sdk'
import getPrices from '../utils/getPrices'
import _ from 'lodash'
import CommerceLayerContext from './context/CommerceLayerContext'
import VariantContext from './context/VariantContext'
import priceReducer from '../reducers/PriceReducer'
import { priceInitialState, PriceState } from '../reducers/PriceReducer'
import PriceContext from './context/PriceContext'
import { setSkuCodesInterface } from '../reducers/VariantReducer'

export interface PriceContainerProps {
  children: ReactNode
  skuCode?: string
}

const PriceContainer: FunctionComponent<PriceContainerProps> = ({
  children,
  skuCode
}) => {
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const { accessToken } = useContext(CommerceLayerContext)
  const { currentSkuCode } = useContext(VariantContext)
  if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  if (_.indexOf(state.skuCodes, currentSkuCode) === -1 && currentSkuCode)
    state.skuCodes.push(currentSkuCode)

  const setSkuCodes: setSkuCodesInterface = skuCodes => {
    dispatch({
      type: 'setSkuCodes',
      payload: skuCodes
    })
  }
  useEffect(() => {
    dispatch({
      type: 'setLoading',
      payload: true
    })
    if (state.skuCodes.length >= 1 && accessToken) {
      Sku.where({ codeIn: state.skuCodes.join(',') })
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
  const priceValue: PriceState = {
    loading: state.loading,
    prices: state.prices,
    skuCode: currentSkuCode || skuCode,
    skuCodes: state.skuCodes,
    setSkuCodes
  }
  return (
    <PriceContext.Provider value={priceValue}>{children}</PriceContext.Provider>
  )
}

export default PriceContainer
