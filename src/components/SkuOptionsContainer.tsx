import React, {
  FunctionComponent,
  useReducer,
  useContext,
  useEffect,
} from 'react'
import SkuOptionsContext from '../context/SkuOptionsContext'
import skuOptionsReducer, {
  skuOptionsInitialState,
} from '../reducers/SkuOptionsReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import { getSkuOptions } from '../reducers/SkuOptionsReducer'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.SkuOptionsContainer.propTypes
const displayName = components.SkuOptionsContainer.displayName

export type SkuOptionsContainerProp = PropsType<typeof propTypes>

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
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const skuOptionsValue = { ...state, skuCode: sCode }
  useEffect(() => {
    if (sCode && item[sCode].skuOptions) {
      getSkuOptions({
        skuOptions: item[sCode].skuOptions().toArray(),
        dispatch,
      })
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
