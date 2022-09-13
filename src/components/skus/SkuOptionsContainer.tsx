import { useReducer, useContext, useEffect } from 'react'
import SkuOptionsContext from '#context/SkuOptionsContext'
import skuOptionsReducer, {
  skuOptionsInitialState,
} from '#reducers/SkuOptionsReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { isEmpty } from 'lodash'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import { getSkuOptions } from '#reducers/SkuOptionsReducer'

type Props = {
  children: JSX.Element
  skuCode?: string
}

export function SkuOptionsContainer(props: Props) {
  const { skuCode, children } = props
  const [state, dispatch] = useReducer(
    skuOptionsReducer,
    skuOptionsInitialState
  )
  const config = useContext(CommerceLayerContext)
  const { item, items } = useContext(ItemContext)
  const sCode =
    !isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const skuOptionsValue = { ...state, skuCode: sCode }
  useEffect(() => {
    if (sCode && item[sCode]?.sku_options) {
      getSkuOptions({
        skuOptions: item[sCode]?.sku_options,
        dispatch,
      })
    }
    return (): void => {
      if (isEmpty(sCode)) {
        dispatch({
          type: 'setSkuOptions',
          payload: {
            skuOptions: [],
          },
        })
      }
    }
  }, [config, sCode])
  return (
    <SkuOptionsContext.Provider value={skuOptionsValue}>
      {children}
    </SkuOptionsContext.Provider>
  )
}

export default SkuOptionsContainer
