import { useContext, useReducer, useEffect, type ReactNode, useMemo, type JSX } from 'react';
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
  /**
   * The children component
   */
  children: ReactNode
  /**
   * The sku code
   */
  skuCode?: string
  /**
   * The sku id. If you use this prop, the skuCode will be ignored and the sku will be fetched by id improving the performance
   */
  skuId?: string
  /**
   * Callback called when the quantity is updated
   */
  getQuantity?: (quantity: number) => void
}

/**
 * Main container for the Availability components.
 * It stores - in its context - the sku quantity returned from the `inventory_model` and the `delivery_lead_time` for the first shipping method found in the inventory model.
 *
 * It can be used to fetch the quantities for a specific `sku_code` passed as prop.
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component. <br/>
 * Can be a child of the `<SkusContainer>` component and receive the `sku_code` from its context.
 * </span>
 * <span title='Children' type='info'>
 * `<AvailabilityTemplate>`
 * </span>
 */
export function AvailabilityContainer({
  children,
  skuCode,
  skuId,
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
      if (sCode != null || skuId != null) {
        getAvailability({ skuCode: sCode, skuId, config, dispatch })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {}
      })
    }
  }, [accessToken, sCode, skuId])
  useEffect(() => {
    if (getQuantity != null && state?.quantity != null)
      getQuantity(state?.quantity)
  }, [state.quantity])
  const memoized = useMemo(() => {
    return { ...state, parent: true }
  }, [state])
  return (
    <AvailabilityContext.Provider value={memoized}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export default AvailabilityContainer
