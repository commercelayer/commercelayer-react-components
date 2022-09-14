import { useEffect, useReducer, useContext, ReactNode } from 'react'
import variantReducer, {
  variantInitialState,
  unsetVariantState,
  setSkuCode,
  getVariants,
} from '#reducers/VariantReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import VariantsContext from '#context/VariantsContext'
import { VariantState } from '#reducers/VariantReducer'
import { setVariantSkuCodes } from '#reducers/VariantReducer'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'

import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import components from '#config/components'
import { Items } from '#reducers/ItemReducer'

const propTypes = components.VariantsContainer.propTypes
const defaultProps = components.VariantsContainer.defaultProps
const displayName = components.VariantsContainer.displayName

type Props = {
  children: ReactNode
  filters?: Record<string, any>
  skuCode?: string
}

export function VariantsContainer(props: Props) {
  const { children, skuCode = '', filters = {} } = props
  const config = useContext(CommerceLayerContext)
  const {
    setItem,
    setItems,
    items,
    item: currentItem,
    setCustomLineItems,
    skuCode: itemSkuCode,
    setSkuCode: setItemSkuCode,
  } = useContext(ItemContext)
  const [state, dispatch] = useReducer(variantReducer, variantInitialState)
  const sCode =
    getCurrentItemKey(currentItem) ||
    skuCode ||
    state.skuCode ||
    itemSkuCode ||
    ''
  useEffect(() => {
    if (!isEmpty(items) && !isEmpty(state.variants)) {
      if (!isEqual(items, state.variants)) {
        const mergeItems = { ...items, ...state.variants } as Items
        setItems && setItems(mergeItems)
      }
    }
    if (state.skuCodes.length >= 1 && config.accessToken) {
      dispatch({
        type: 'setLoading',
        payload: { loading: true },
      })
      getVariants({
        config,
        state,
        dispatch,
        setItem,
        skuCode: sCode,
        filters,
      })
    }
    return (): void => unsetVariantState(dispatch)
  }, [config.accessToken])
  const variantValue: VariantState = {
    ...state,
    skuCode: sCode,
    setSkuCode: (code, id, lineItem = {}) => {
      if (!isEmpty(lineItem)) {
        setCustomLineItems && setCustomLineItems({ [code]: lineItem })
      }
      setSkuCode({
        code,
        id,
        config,
        setItem,
        dispatch,
        setItemSkuCode,
      })
    },
    setSkuCodes: (skuCodes) =>
      setVariantSkuCodes({ skuCodes, dispatch, setCustomLineItems }),
  }
  return (
    <VariantsContext.Provider value={variantValue}>
      {children}
    </VariantsContext.Provider>
  )
}

VariantsContainer.propTypes = propTypes
VariantsContainer.defaultProps = defaultProps
VariantsContainer.displayName = displayName

export default VariantsContainer
