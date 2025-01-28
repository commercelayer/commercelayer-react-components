import { useEffect, useContext, useReducer, type JSX } from 'react';
import CommerceLayerContext from '#context/CommerceLayerContext'
import priceReducer, {
  priceInitialState,
  getSkusPrice,
  setSkuCodes
} from '#reducers/PriceReducer'
import PricesContext, { type PricesContextValue } from '#context/PricesContext'
import type { LoaderType } from '#typings'
import SkuContext from '#context/SkuContext'
import type { QueryPageSize } from '@commercelayer/sdk'

interface Props {
  /**
   * Any valid JSX.Element(s).
   * A single `<Price>` component or a list of them is expected to render the prices.
   */
  children: JSX.Element | JSX.Element[]
  /**
   * SDK query filter to fetch the prices when multiple prices are requested.
   */
  filters?: object
  /**
   * Loader component or string to be rendered while the prices are being fetched.
   * @default 'Loading...'
   */
  loader?: LoaderType
  /**
   * Prices per page to be fetched
   */
  perPage?: QueryPageSize
  /**
   * SKU code to fetch the prices for. If not provided, the `sku_code` will be retrieved from the `<Price>` component(s) nested as children.
   */
  skuCode?: string
}

/**
 * Main container for the Prices components. It stores the prices context.
 *
 * It can be used to fetch the prices for a specific `sku_code` passed as prop
 * or for the `sku_code` retrieved from all `<Price>` components nested as children.
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<Price>`
 * </span>
 */
export function PricesContainer(props: Props): JSX.Element {
  const {
    children,
    skuCode = '',
    loader = 'Loading...',
    perPage = 10,
    filters = {}
  } = props
  const [state, dispatch] = useReducer(priceReducer, priceInitialState)
  const config = useContext(CommerceLayerContext)
  const { skuCodes } = useContext(SkuContext)
  if (!state.skuCodes.includes(skuCode) && skuCode) state.skuCodes.push(skuCode)
  const sCode = skuCodes && skuCodes?.length > 0 ? '' : skuCode ?? ''
  useEffect(() => {
    if (
      state.skuCodes.length === 0 &&
      skuCodes != null &&
      skuCodes.length > 0 &&
      state.setSkuCodes != null
    ) {
      state.setSkuCodes({ skuCodes, dispatch })
    }
    if (config.accessToken) {
      if (state.skuCodes.length > 0 || sCode) {
        getSkusPrice((sCode && [sCode]) || state.skuCodes, {
          config,
          dispatch,
          perPage,
          filters
        })
      }
    }
  }, [config.accessToken, sCode, state.skuCodes.length])
  const priceValue: PricesContextValue = {
    ...state,
    skuCode: sCode,
    loader,
    setSkuCodes: (params: Parameters<typeof setSkuCodes>[number]): void => {
      setSkuCodes({ ...params, dispatch })
    }
  }
  return (
    <PricesContext.Provider value={priceValue}>
      {children}
    </PricesContext.Provider>
  )
}

export default PricesContainer
