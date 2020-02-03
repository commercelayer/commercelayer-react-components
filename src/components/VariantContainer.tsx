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
      payload: { currentQuantity: quantity }
    })
  }
  const setSkuCodes: SetSkuCodesVariant = skuCodes => {
    const sCodes = skuCodes.map(s => s.code)
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes: sCodes, active: true }
    })
  }
  const setSkuCode: SetSkuCodeVariant = (code, id) => {
    if (id) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: { currentSkuCode: code }
      })
      dispatch({
        type: 'setCurrentSkuId',
        payload: { currentSkuId: id }
      })
      Sku.includes('prices')
        .find(id)
        .then(s => {
          dispatch({
            type: 'setCurrentSkuInventory',
            payload: { currentSkuInventory: s.inventory }
          })
          dispatch({
            type: 'setCurrentPrices',
            payload: { currentPrices: [s] }
          })
        })
    } else {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: { currentSkuCode: '' }
      })
      dispatch({
        type: 'setCurrentSkuId',
        payload: { currentSkuId: '' }
      })
      dispatch({
        type: 'setCurrentSkuInventory',
        payload: {
          currentSkuInventory: {
            available: false,
            quantity: 0
          }
        }
      })
    }
  }

  useEffect(() => {
    if (skuCode) {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: { currentSkuCode: skuCode }
      })
    }
    if (state.skuCodes.length >= 1 && accessToken) {
      dispatch({
        type: 'setLoading',
        payload: { loading: true, active: true }
      })
      Sku.where({ codeIn: state.skuCodes.join(',') })
        .perPage(25)
        .all()
        .then(r => {
          const skusObj = getSkus(r.toArray())
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
    return (): void => {
      dispatch({
        type: 'setCurrentSkuCode',
        payload: { currentSkuCode: '' }
      })
      dispatch({
        type: 'setVariants',
        payload: { variants: null }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false, active: false }
      })
    }
  }, [accessToken])
  const variantValue: VariantState = {
    active: state.active,
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
  console.log('variantValue', variantValue)
  return (
    <VariantContext.Provider value={variantValue}>
      {children}
    </VariantContext.Provider>
  )
}

export default VariantContainer
