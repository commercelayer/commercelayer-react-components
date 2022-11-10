import { useEffect, useContext, useReducer } from 'react'
import CommerceLayerContext from '#context/CommerceLayerContext'
import priceReducer, {
  priceInitialState,
  getSkusPrice,
  setSkuCodes
} from '#reducers/PriceReducer'
import PricesContext, { PricesContextValue } from '#context/PricesContext'
import { LoaderType } from '#typings'
import SkuContext from '#context/SkuContext'

interface Props {
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
    setSkuCodes: (params: Parameters<typeof setSkuCodes>[number]): void =>
      setSkuCodes({ ...params, dispatch })
  }
  return (
    <PricesContext.Provider value={priceValue}>
      {children}
    </PricesContext.Provider>
  )
}

export default PricesContainer
