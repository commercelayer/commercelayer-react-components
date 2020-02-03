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
import priceReducer, { SetSkuCodesPrice } from '../reducers/PriceReducer'
import { priceInitialState, PriceState } from '../reducers/PriceReducer'
import PriceContext from './context/PriceContext'
// import OrderContext from './context/OrderContext'

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
  const { currentSkuCode, currentPrices } = useContext(VariantContext)
  // const { currentSkuPrices, setCurrentSkuPrices } = useContext(OrderContext)
  // if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
  //   state.skuCodes.push(skuCode)
  // if (_.indexOf(state.skuCodes, currentSkuCode) === -1 && currentSkuCode)
  //   state.skuCodes.push(currentSkuCode)
  console.log('skuCodes', state.skuCodes)
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
    if (currentPrices.length > 0) {
      const pricesObj = getPrices(currentPrices)
      dispatch({
        type: 'setPrices',
        payload: { prices: pricesObj }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false }
      })
    } else if (state.skuCodes.length >= 1 && accessToken) {
      Sku.where({ codeIn: state.skuCodes.join(',') })
        .includes('prices')
        .perPage(25)
        .all()
        .then(r => {
          const pricesObj = getPrices(r.toArray())
          dispatch({
            type: 'setPrices',
            payload: { prices: pricesObj }
          })
          dispatch({
            type: 'setLoading',
            payload: { loading: false }
          })
        })
    }
    return (): void => {
      dispatch({
        type: 'setPrices',
        payload: {
          prices: {}
        }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false }
      })
    }
  }, [accessToken, currentPrices])
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
