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

export interface PriceContainerProps {
  children: ReactNode
  skuCode?: string
}

const PriceContainer: FunctionComponent<PriceContainerProps> = props => {
  const { children, skuCode } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  // TODO: Move to OrderContainer
  const config = useContext(CommerceLayerContext)
  const { setItems, items } = useContext(OrderContext)

  // const { currentSkuCode, currentPrices } = useContext(VariantContext)
  if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  // if (_.indexOf(state.skuCodes, currentSkuCode) === -1 && currentSkuCode)
  //   state.skuCodes.push(currentSkuCode)
  const sCode = skuCode // TODO: add current by OrderContainer
  const setSkuCodes: SetSkuCodesPrice = skuCodes => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes }
    })
  }
  useEffect(() => {
    dispatch({
      type: 'setLoading',
      payload: { loading: true }
    })
    if (!_.isEmpty(items)) {
      const p = getPrices(items)
      dispatch({
        type: 'setPrices',
        payload: { prices: p }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false }
      })
    } else {
      if (config.accessToken) {
        if (state.skuCodes.length > 0 || skuCode) {
          getSkusPrice((skuCode && [skuCode]) || state.skuCodes, {
            config,
            dispatch,
            setItems,
            items
          })
        }
      }
    }
    return (): void => unsetPriceState(dispatch)
  }, [config.accessToken])
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
