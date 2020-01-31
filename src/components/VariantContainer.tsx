import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import { Sku } from '@commercelayer/js-sdk'
import getSkus from '../utils/getSkus'
import variantReducer, {
  variantInitialState,
  SetCurrentQuantity
} from '../reducers/VariantReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import VariantContext from './context/VariantContext'
import {
  SetSkuCodeVariant,
  VariantState,
  SetSkuCodesVariant
} from '../reducers/VariantReducer'

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
  const setCurrentQuantity: SetCurrentQuantity = quantity => {
    dispatch({
      type: 'setCurrentQuantity',
      payload: quantity
    })
  }
  const setSkuCodes: SetSkuCodesVariant = skuCodes => {
    const sCodes = skuCodes.map(s => s.code)
    dispatch({
      type: 'setSkuCodes',
      payload: sCodes
    })
  }
  const setSkuCode: SetSkuCodeVariant = (code, id) => {
    if (id) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: code
      })
      dispatch({
        type: 'setCurrentSkuId',
        payload: id
      })
      Sku.includes('prices')
        .find(id)
        .then(s => {
          dispatch({
            type: 'setCurrentSkuInventory',
            payload: s.inventory
          })
          dispatch({
            type: 'setCurrentPrices',
            payload: [s]
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
    if (skuCode) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: skuCode
      })
    }
    if (state.skuCodes.length >= 1 && accessToken) {
      dispatch({
        type: 'setLoading',
        payload: true
      })
      Sku.where({ codeIn: state.skuCodes.join(',') })
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
    return (): void => {
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
    skuCodes: state.skuCodes,
    currentSkuId: state.currentSkuId,
    currentSkuCode: state.currentSkuCode || skuCode,
    currentSkuInventory: state.currentSkuInventory,
    currentQuantity: state.currentQuantity,
    currentPrices: state.currentPrices,
    setCurrentQuantity,
    setSkuCode,
    setSkuCodes
  }
  return (
    <VariantContext.Provider value={variantValue}>
      {children}
    </VariantContext.Provider>
  )
}

export default VariantContainer
