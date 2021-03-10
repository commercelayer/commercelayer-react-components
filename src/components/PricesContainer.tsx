import React, {
  useEffect,
  FunctionComponent,
  useContext,
  useReducer,
  ReactNode,
} from 'react'
import getPrices from '#utils/getPrices'
import { isEmpty, indexOf, has } from 'lodash'
import CommerceLayerContext from '#context/CommerceLayerContext'
import priceReducer, {
  SetSkuCodesPrice,
  unsetPriceState,
} from '#reducers/PriceReducer'
import { priceInitialState, getSkusPrice } from '#reducers/PriceReducer'
import PricesContext, { PricesContextValue } from '#context/PricesContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import components from '#config/components'
import { LoaderType } from '#typings'

const propTypes = components.PricesContainer.propTypes
const defaultProps = components.PricesContainer.defaultProps
const displayName = components.PricesContainer.displayName

type PricesContainerProps = {
  children: ReactNode
  filters?: object
  loader?: LoaderType
  perPage?: number
  skuCode?: string
}

const PricesContainer: FunctionComponent<PricesContainerProps> = (props) => {
  const {
    children,
    skuCode = '',
    loader = 'Loading...',
    perPage = 10,
    filters = {},
  } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const {
    setPrices,
    prices,
    items,
    item: currentItem,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  if (indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  const sCode = getCurrentItemKey(currentItem) || skuCode || itemSkuCode || ''
  const setSkuCodes: SetSkuCodesPrice = (skuCodes) => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes },
    })
  }
  useEffect(() => {
    if (currentItem && has(prices, sCode)) {
      dispatch({
        type: 'setPrices',
        payload: { prices: prices },
      })
    }
    if (!isEmpty(items) && isEmpty(currentItem)) {
      const p = getPrices(items)
      dispatch({
        type: 'setPrices',
        payload: { prices: p },
      })
    }
    if (
      (config.accessToken && isEmpty(currentItem)) ||
      (config.accessToken && !has(prices, sCode))
    ) {
      if (state.skuCodes.length > 0 || skuCode) {
        getSkusPrice((sCode && [sCode]) || state.skuCodes, {
          config,
          dispatch,
          setPrices,
          prices,
          perPage,
          filters,
        })
      }
    }
    return (): void => {
      if (isEmpty(currentItem)) {
        unsetPriceState(dispatch)
      }
    }
  }, [config.accessToken, currentItem, sCode])
  const priceValue: PricesContextValue = {
    ...state,
    skuCode: sCode,
    loader,
    setSkuCodes,
  }
  return (
    <PricesContext.Provider value={priceValue}>
      {children}
    </PricesContext.Provider>
  )
}

PricesContainer.propTypes = propTypes
PricesContainer.defaultProps = defaultProps
PricesContainer.displayName = displayName

export default PricesContainer
