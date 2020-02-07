import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import CLayer from '@commercelayer/js-sdk'
import getSkus from '../utils/getSkus'
import variantReducer, {
  variantInitialState,
  SetCurrentQuantity,
  unsetVariantState
} from '../reducers/VariantReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import VariantContext from './context/VariantContext'
import { SetSkuCodeVariant, VariantState } from '../reducers/VariantReducer'
import OrderContext from './context/OrderContext'
import { setVariantSkuCodes } from '../reducers/VariantReducer'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'

export interface VariantContainerProps {
  children: ReactNode
  skuCode?: string
}

const VariantContainer: FunctionComponent<VariantContainerProps> = props => {
  const { children, skuCode } = props
  const config = useContext(CommerceLayerContext)
  const { setCurrentItem, setItems, items, currentItem } = useContext(
    OrderContext
  )
  const [state, dispatch] = useReducer(variantReducer, variantInitialState)
  const sCode = getCurrentItemKey(currentItem) || skuCode || state.skuCode
  const setCurrentQuantity: SetCurrentQuantity = quantity => {
    dispatch({
      type: 'setCurrentQuantity',
      payload: { currentQuantity: quantity }
    })
  }
  const setSkuCode: SetSkuCodeVariant = (code, id) => {
    if (id) {
      CLayer.Sku.withCredentials(config)
        .includes('prices')
        .find(id)
        .then(s => {
          setCurrentItem({
            [`${code}`]: s
          })
        })
    }
  }
  if (!_.isEmpty(items) && !_.isEmpty(state.variants)) {
    if (!_.isEqual(items, state.variants)) {
      const mergeItems = { ...items, ...state.variants }
      setItems(mergeItems)
    }
  }
  useEffect(() => {
    if (state.skuCodes.length >= 1 && config.accessToken) {
      dispatch({
        type: 'setLoading',
        payload: { loading: true }
      })
      CLayer.Sku.withCredentials(config)
        .where({ codeIn: state.skuCodes.join(',') })
        .includes('prices')
        .perPage(25)
        .all()
        .then(r => {
          const skusObj = getSkus(r.toArray())
          if (skuCode) {
            setSkuCode(skusObj[skuCode].code, skusObj[skuCode].id)
          }
          dispatch({
            type: 'setVariants',
            payload: {
              variants: skusObj
            }
          })
          dispatch({
            type: 'setLoading',
            payload: {
              loading: false
            }
          })
        })
    }
    return (): void => unsetVariantState(dispatch)
  }, [config])
  const variantValue: VariantState = {
    loading: state.loading,
    variants: state.variants,
    skuCodes: state.skuCodes,
    currentSkuId: state.currentSkuId,
    skuCode: sCode,
    currentSkuInventory: state.currentSkuInventory,
    currentQuantity: state.currentQuantity,
    currentPrices: state.currentPrices,
    setCurrentQuantity,
    setSkuCode,
    setSkuCodes: skuCodes => setVariantSkuCodes(skuCodes, dispatch)
  }
  return (
    <VariantContext.Provider value={variantValue}>
      {children}
    </VariantContext.Provider>
  )
}

export default VariantContainer
