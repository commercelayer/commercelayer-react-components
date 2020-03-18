import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext
} from 'react'
import variantReducer, {
  variantInitialState,
  unsetVariantState,
  setSkuCode,
  getVariants
} from '../reducers/VariantReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import VariantContext from '../context/VariantContext'
import { VariantState } from '../reducers/VariantReducer'
import { setVariantSkuCodes } from '../reducers/VariantReducer'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import PropTypes, { InferProps } from 'prop-types'

const VCProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string,
  filters: PropTypes.object
}

export type VariantContainerProps = InferProps<typeof VCProps>

const VariantContainer: FunctionComponent<VariantContainerProps> = props => {
  const { children, skuCode, filters } = props
  const config = useContext(CommerceLayerContext)
  const { setItem, setItems, items, item: currentItem } = useContext(
    ItemContext
  )
  const [state, dispatch] = useReducer(variantReducer, variantInitialState)
  const sCode = getCurrentItemKey(currentItem) || skuCode || state.skuCode
  useEffect(() => {
    if (!_.isEmpty(items) && !_.isEmpty(state.variants)) {
      if (!_.isEqual(items, state.variants)) {
        const mergeItems = { ...items, ...state.variants }
        setItems(mergeItems)
      }
    }
    if (state.skuCodes.length >= 1 && config.accessToken) {
      dispatch({
        type: 'setLoading',
        payload: { loading: true }
      })
      getVariants({ config, state, dispatch, setItem, skuCode: sCode, filters })
    }
    return (): void => unsetVariantState(dispatch)
  }, [config])
  const variantValue: VariantState = {
    ...state,
    skuCode: sCode,
    setSkuCode: (code, id) =>
      setSkuCode({ code, id, config, setItem, dispatch }),
    setSkuCodes: skuCodes => setVariantSkuCodes(skuCodes, dispatch)
  }
  return (
    <VariantContext.Provider value={variantValue}>
      {children}
    </VariantContext.Provider>
  )
}

VariantContainer.propTypes = VCProps

VariantContainer.defaultProps = {
  skuCode: '',
  filters: {}
}

export default VariantContainer
