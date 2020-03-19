import React, {
  useEffect,
  FunctionComponent,
  useContext,
  useReducer
} from 'react'
import getPrices from '../utils/getPrices'
import _ from 'lodash'
import CommerceLayerContext from '../context/CommerceLayerContext'
import priceReducer, {
  SetSkuCodesPrice,
  unsetPriceState
} from '../reducers/PriceReducer'
import {
  priceInitialState,
  PriceState,
  getSkusPrice
} from '../reducers/PriceReducer'
import PriceContext from '../context/PriceContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import PropTypes, { InferProps } from 'prop-types'
import { PTLoader } from '../@types/index'

export const PriceContainerProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string,
  loader: PTLoader,
  perPage: PropTypes.number,
  filters: PropTypes.object
}

export type PCProps = InferProps<typeof PriceContainerProps>

const PriceContainer: FunctionComponent<PCProps> = props => {
  const { children, skuCode, loader, perPage, filters } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const { setPrices, prices, items, item: currentItem } = useContext(
    ItemContext
  )
  if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  const sCode = getCurrentItemKey(currentItem) || skuCode
  const setSkuCodes: SetSkuCodesPrice = skuCodes => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes }
    })
  }
  useEffect(() => {
    if (currentItem && _.has(prices, sCode)) {
      dispatch({
        type: 'setPrices',
        payload: { prices: prices }
      })
    }
    if (!_.isEmpty(items) && _.isEmpty(currentItem)) {
      const p = getPrices(items)
      dispatch({
        type: 'setPrices',
        payload: { prices: p }
      })
    }
    if (
      (config.accessToken && _.isEmpty(currentItem)) ||
      (config.accessToken && !_.has(prices, sCode))
    ) {
      if (state.skuCodes.length > 0 || skuCode) {
        getSkusPrice((sCode && [sCode]) || state.skuCodes, {
          config,
          dispatch,
          setPrices,
          prices,
          perPage,
          filters
        })
      }
    }
    return (): void => unsetPriceState(dispatch)
  }, [config.accessToken, currentItem])
  const priceValue: PriceState = {
    ...state,
    skuCode: sCode,
    loader,
    setSkuCodes
  }
  return (
    <PriceContext.Provider value={priceValue}>{children}</PriceContext.Provider>
  )
}

PriceContainer.propTypes = PriceContainerProps

PriceContainer.defaultProps = {
  perPage: 10,
  filters: {},
  loader: 'Loading...'
}

export default PriceContainer
