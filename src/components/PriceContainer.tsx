import React, {
  useEffect,
  FunctionComponent,
  useContext,
  ReactNode,
  useReducer
} from 'react'
import getPrices from '../utils/getPrices'
import _ from 'lodash'
import CommerceLayerContext from './context/CommerceLayerContext'
import priceReducer, {
  SetSkuCodesPrice,
  unsetPriceState
} from '../reducers/PriceReducer'
import {
  priceInitialState,
  PriceState,
  getSkusPrice
} from '../reducers/PriceReducer'
import PriceContext from './context/PriceContext'
import OrderContext from './context/OrderContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'

export interface PriceContainerProps {
  children: ReactNode
  skuCode?: string
}

const PriceContainer: FunctionComponent<PriceContainerProps> = props => {
  const { children, skuCode } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const { setItems, items, currentItem } = useContext(OrderContext)
  // TODO: Remove comments
  // const { currentSkuCode, currentPrices } = useContext(VariantContext)
  if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  // if (_.indexOf(state.skuCodes, currentSkuCode) === -1 && currentSkuCode)
  //   state.skuCodes.push(currentSkuCode)
  const sCode = getCurrentItemKey(currentItem) || skuCode
  const setSkuCodes: SetSkuCodesPrice = skuCodes => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes }
    })
  }
  useEffect(() => {
    if (currentItem) {
      const p = getPrices(currentItem)
      dispatch({
        type: 'setPrices',
        payload: { prices: p }
      })
    }
    if (!_.isEmpty(items) && _.isEmpty(currentItem)) {
      const p = getPrices(items)
      dispatch({
        type: 'setPrices',
        payload: { prices: p }
      })
    }
    if (config.accessToken && _.isEmpty(currentItem)) {
      if (state.skuCodes.length > 0 || skuCode) {
        dispatch({
          type: 'setLoading',
          payload: { loading: true }
        })
        getSkusPrice((skuCode && [skuCode]) || state.skuCodes, {
          config,
          dispatch,
          setItems,
          items
        })
      }
    }
    return (): void => unsetPriceState(dispatch)
  }, [config.accessToken, currentItem])
  const priceValue: PriceState = {
    loading: state.loading,
    prices: state.prices,
    skuCode: sCode,
    skuCodes: state.skuCodes,
    setSkuCodes
  }
  return (
    <PriceContext.Provider value={priceValue}>{children}</PriceContext.Provider>
  )
}

export default PriceContainer
