import React, {
  useEffect,
  FunctionComponent,
  useContext,
  useReducer,
} from 'react'
import getPrices from '../utils/getPrices'
import _ from 'lodash'
import CommerceLayerContext from '../context/CommerceLayerContext'
import priceReducer, {
  SetSkuCodesPrice,
  unsetPriceState,
} from '../reducers/PriceReducer'
import { priceInitialState, getSkusPrice } from '../reducers/PriceReducer'
import PriceContext, { PriceContextValue } from '../context/PriceContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.PriceContainer.propTypes
const defaultProps = components.PriceContainer.defaultProps
const displayName = components.PriceContainer.displayName

export type PCProps = PropsType<typeof propTypes>

const PriceContainer: FunctionComponent<PCProps> = (props) => {
  const { children, skuCode, loader, perPage, filters } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const { setPrices, prices, items, item: currentItem } = useContext(
    ItemContext
  )
  if (_.indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  const sCode = getCurrentItemKey(currentItem) || skuCode || ''
  const setSkuCodes: SetSkuCodesPrice = (skuCodes) => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes },
    })
  }
  useEffect(() => {
    if (currentItem && _.has(prices, sCode)) {
      dispatch({
        type: 'setPrices',
        payload: { prices: prices },
      })
    }
    if (!_.isEmpty(items) && _.isEmpty(currentItem)) {
      const p = getPrices(items)
      dispatch({
        type: 'setPrices',
        payload: { prices: p },
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
          perPage: perPage || 0,
          filters: filters || {},
        })
      }
    }
    return (): void => unsetPriceState(dispatch)
  }, [config.accessToken, currentItem])
  const priceValue: PriceContextValue = {
    ...state,
    skuCode: sCode,
    loader: loader || 'Loading...',
    setSkuCodes,
  }
  return (
    <PriceContext.Provider value={priceValue}>{children}</PriceContext.Provider>
  )
}

PriceContainer.propTypes = propTypes
PriceContainer.defaultProps = defaultProps
PriceContainer.displayName = displayName

export default PriceContainer
