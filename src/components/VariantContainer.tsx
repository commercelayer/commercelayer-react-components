import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import getChildrenProp from '../utils/getChildrenProp'
import { Sku } from '@commercelayer/js-sdk'
import getSkus from '../utils/getSkus'
import variantReducer, {
  variantInitialState,
  setCurrentQuantityInterface
} from '../reducers/VariantReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import VariantContext from './context/VariantContext'
import { setSkuCodeInterface, VariantState } from '../reducers/VariantReducer'

export interface VariantContainerProps {
  children: ReactNode
  skuCode?: string
}

const VariantContainer: FunctionComponent<VariantContainerProps> = ({
  children,
  skuCode
}) => {
  const { accessToken } = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(variantReducer, variantInitialState)
  const skuCodes = getChildrenProp(children, 'skuCodes')
  const setCurrentQuantity: setCurrentQuantityInterface = quantity => {
    dispatch({
      type: 'setCurrentQuantity',
      payload: quantity
    })
  }
  const setSkuCode: setSkuCodeInterface = (code, id) => {
    if (id) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: code
      })
      dispatch({
        type: 'setCurrentSkuId',
        payload: id
      })
      Sku.find(id).then(s => {
        dispatch({
          type: 'setCurrentSkuInventory',
          payload: s.inventory
        })
      })
    } else {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: ''
      })
      dispatch({
        type: 'setCurrentSkuId',
        payload: ''
      })
      dispatch({
        type: 'setCurrentSkuInventory',
        payload: {
          available: false,
          quantity: 0
        }
      })
    }
  }

  useEffect(() => {
    dispatch({
      type: 'setLoading',
      payload: true
    })
    if (skuCode) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: skuCode
      })
    }
    if (skuCodes.length >= 1 && accessToken) {
      Sku.where({ codeIn: skuCodes.join(',') })
        .perPage(25)
        .all()
        .then(r => {
          const skusObj = getSkus(r.toArray())
          dispatch({
            type: 'setVariants',
            payload: skusObj
          })
          dispatch({
            type: 'setLoading',
            payload: false
          })
        })
    }
    return () => {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: ''
      })
      dispatch({
        type: 'setVariants',
        payload: null
      })
      dispatch({
        type: 'setLoading',
        payload: false
      })
    }
  }, [accessToken])
  const variantValue: VariantState = {
    loading: state.loading,
    variants: state.variants,
    currentSkuId: state.currentSkuId,
    currentSkuCode: state.currentSkuCode || skuCode,
    currentSkuInventory: state.currentSkuInventory,
    currentQuantity: state.currentQuantity,
    setCurrentQuantity,
    setSkuCode
  }
  return (
    <VariantContext.Provider value={variantValue}>
      {children}
    </VariantContext.Provider>
  )
}

export default VariantContainer
