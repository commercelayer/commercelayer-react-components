import React, {
  FunctionComponent,
  useReducer,
  useContext,
  useEffect
} from 'react'
import PropTypes, { InferProps } from 'prop-types'
import SkuOptionsContext from '../context/SkuOptionsContext'
import skuOptionsReducer, {
  skuOptionsInitialState,
  unsetSkuOptionsState
} from '../reducers/SkuOptionsReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import { getSkuOptions } from '../reducers/SkuOptionsReducer'

const SOCProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string
}

export type SkuOptionsContainerProp = InferProps<typeof SOCProps>

const SkuOptionsContainer: FunctionComponent<SkuOptionsContainerProp> = props => {
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
    if (sCode) {
      getSkuOptions({
        skuCode: sCode,
        dispatch,
        config
      })
    }
    return (): void => unsetSkuOptionsState(dispatch)
  }, [config, sCode])
  return (
    <SkuOptionsContext.Provider value={skuOptionsValue}>
      {children}
    </SkuOptionsContext.Provider>
  )
}

SkuOptionsContainer.propTypes = SOCProps

export default SkuOptionsContainer
