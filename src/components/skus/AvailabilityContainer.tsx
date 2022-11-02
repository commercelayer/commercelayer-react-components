import { useContext, useReducer, useEffect, ReactNode } from 'react'
import availabilityReducer, {
  availabilityInitialState,
  getAvailability
} from '#reducers/AvailabilityReducer'
import AvailabilityContext from '#context/AvailabilityContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import SkuChildrenContext from '#context/SkuChildrenContext'
import useCustomContext from '#utils/hooks/useCustomContext'

interface Props {
  children: ReactNode
  skuCode?: string
  getQuantity?: (quantity: number) => void
}

export function AvailabilityContainer({
  children,
  skuCode,
  getQuantity
}: Props): JSX.Element {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { sku } = useContext(SkuChildrenContext)
  const { accessToken, endpoint } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: 'CommerceLayer',
    currentComponentName: 'AvailabilityContainer',
    key: 'accessToken'
  })
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  const sCode = skuCode || lineItem?.sku_code || sku?.code
  useEffect(() => {
    if (accessToken != null && accessToken !== '') {
      const config = { accessToken, endpoint }
      if (sCode) {
        void getAvailability({ skuCode: sCode, config, dispatch })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {}
      })
    }
  }, [accessToken, sCode])
  useEffect(() => {
    if (getQuantity != null && state?.quantity != null)
      getQuantity(state?.quantity)
  }, [state.quantity])

  return (
    <AvailabilityContext.Provider value={{ ...state, parent: true }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export default AvailabilityContainer
