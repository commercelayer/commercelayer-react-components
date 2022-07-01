import {
  FunctionComponent,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from 'react'
import SkuOptionsContext from '#context/SkuOptionsContext'
import skuOptionsReducer, {
  skuOptionsInitialState,
} from '#reducers/SkuOptionsReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { isEmpty } from 'lodash'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import { getSkuOptions } from '#reducers/SkuOptionsReducer'
import components from '#config/components'

const propTypes = components.SkuOptionsContainer.propTypes
const displayName = components.SkuOptionsContainer.displayName

type SkuOptionsContainerProp = {
  children: ReactNode
  skuCode?: string
}

const SkuOptionsContainer: FunctionComponent<SkuOptionsContainerProp> = (
  props
) => {
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

SkuOptionsContainer.propTypes = propTypes
SkuOptionsContainer.displayName = displayName

export default SkuOptionsContainer
