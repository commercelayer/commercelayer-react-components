import { useEffect, useReducer, useContext } from 'react'
import variantReducer, {
  variantInitialState,
  unsetVariantState,
  setSkuCode,
  getVariants,
  VariantState,
  setVariantSkuCodes
} from '#reducers/VariantReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import VariantsContext from '#context/VariantsContext'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'

import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import { Items } from '#reducers/ItemReducer'

interface Props {
  children: JSX.Element | JSX.Element[]
  filters?: Record<string, any>
  skuCode?: string
}

export function VariantsContainer(props: Props): JSX.Element {
  const { children, skuCode = '', filters = {} } = props
  const config = useContext(CommerceLayerContext)
  if (config.accessToken == null)
    throw new Error('Cannot use `VariantsContainer` outside of `CommerceLayer`')
  const {
    setItem,
    setItems,
    items,
    item: currentItem,
    setCustomLineItems,
    skuCode: itemSkuCode,
    setSkuCode: setItemSkuCode
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
        if (setItems) setItems(mergeItems)
      }
    }
    console.log('state.skuCodes', state.skuCodes)
    if (state.skuCodes.length >= 1 && config.accessToken) {
      dispatch({
        type: 'setLoading',
        payload: { loading: true }
      })
      getVariants({
        config,
        state,
        dispatch,
        setItem,
        skuCode: sCode,
        filters
      })
    }
    return (): void => unsetVariantState(dispatch)
  }, [config?.accessToken])
  const variantValue: VariantState = {
    ...state,
    skuCode: sCode,
    setSkuCode: (code, id, lineItem = {}) => {
      if (!isEmpty(lineItem) && setCustomLineItems) {
        setCustomLineItems({ [code]: lineItem })
      }
      setSkuCode({
        code,
        id,
        config,
        setItem,
        dispatch,
        setItemSkuCode
      })
    },
    setSkuCodes: (skuCodes) =>
      setVariantSkuCodes({ skuCodes, dispatch, setCustomLineItems })
  }
  return (
    <VariantsContext.Provider value={variantValue}>
      {children}
    </VariantsContext.Provider>
  )
}

export default VariantsContainer
