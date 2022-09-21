import { useEffect, useContext, useReducer } from 'react'
import getPrices from '#utils/getPrices'
import isEmpty from 'lodash/isEmpty'
import has from 'lodash/has'
import indexOf from 'lodash/indexOf'
import CommerceLayerContext from '#context/CommerceLayerContext'
import priceReducer, {
  SetSkuCodesPrice,
  unsetPriceState,
} from '#reducers/PriceReducer'
import { priceInitialState, getSkusPrice } from '#reducers/PriceReducer'
import PricesContext, { PricesContextValue } from '#context/PricesContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import { LoaderType } from '#typings'
import SkuContext from '#context/SkuContext'

type Props = {
  children: JSX.Element | JSX.Element[]
  filters?: object
  loader?: LoaderType
  perPage?: number
  skuCode?: string
}

export function PricesContainer(props: Props): JSX.Element {
  const {
    children,
    skuCode = '',
    loader = 'Loading...',
    perPage = 10,
    filters = {},
  } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const { skuCodes } = useContext(SkuContext)
  const {
    setPrices,
    prices,
    items,
    item: currentItem,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  if (indexOf(state.skuCodes, skuCode) === -1 && skuCode)
    state.skuCodes.push(skuCode)
  const sCode =
    skuCodes && skuCodes?.length > 0
      ? ''
      : skuCode || getCurrentItemKey(currentItem) || itemSkuCode || ''
  const setSkuCodes: SetSkuCodesPrice = (skuCodes) => {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes },
    })
  }
  useEffect(() => {
    if (state.skuCodes.length === 0 && skuCodes && skuCodes.length > 0) {
      setSkuCodes(skuCodes)
    }
    if (currentItem && has(prices, sCode)) {
      dispatch({
        type: 'setPrices',
        payload: { prices: prices },
      })
    }
    if (!isEmpty(items) && isEmpty(currentItem)) {
      // TODO: Remove any type
      const p = getPrices(items as any)
      dispatch({
        type: 'setPrices',
        payload: { prices: p },
      })
    }
    if (config.accessToken && !has(prices, itemSkuCode || sCode)) {
      if (state.skuCodes.length > 0 || itemSkuCode || sCode) {
        getSkusPrice((sCode && [itemSkuCode || sCode]) || state.skuCodes, {
          config,
          dispatch,
          setPrices,
          prices,
          perPage,
          filters,
        })
      }
    }
    if (config.accessToken && isEmpty(currentItem)) {
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
  }, [
    config.accessToken,
    currentItem,
    sCode,
    state.skuCodes.length,
    itemSkuCode,
  ])
  const priceValue: PricesContextValue = {
    ...state,
    skuCode: sCode,
    loader,
    setSkuCodes,
  }
  if (!config.accessToken) throw new Error('No access token provided')
  if (!config.endpoint) throw new Error('No endpoint provided')
  return (
    <PricesContext.Provider value={priceValue}>
      {children}
    </PricesContext.Provider>
  )
}

export default PricesContainer
