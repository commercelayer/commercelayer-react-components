import React, {
  useContext,
  useReducer,
  FunctionComponent,
  useEffect,
  ReactNode,
} from 'react'
import availabilityReducer, {
  availabilityInitialState,
  getAvailability,
} from '#reducers/AvailabilityReducer'
import AvailabilityContext from '#context/AvailabilityContext'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import components from '#config/components'
import CommerceLayerContext from '#context/CommerceLayerContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import SkuChildrenContext from '#context/SkuChildrenContext'

const propTypes = components.AvailabilityContainer.propTypes
const displayName = components.AvailabilityContainer.displayName

type AvailabilityContainerProps = {
  children: ReactNode
  skuCode?: string
}

const AvailabilityContainer: FunctionComponent<AvailabilityContainerProps> = (
  props
) => {
  const { children, skuCode } = props
  const { item, skuCode: itemSkuCode, setItem } = useContext(ItemContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  const { sku } = useContext(SkuChildrenContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  const sCode =
    skuCode ||
    getCurrentItemKey(item) ||
    itemSkuCode ||
    lineItem?.sku_code ||
    sku?.code
  useEffect(() => {
    if (sCode) {
      const available = item[sCode]?.inventory?.available
      const quantity = item[sCode]?.inventory?.quantity
      const [level] = item[sCode]?.inventory?.levels || [
        {
          quantity: null,
          delivery_lead_times: [],
        },
      ]
      if (level !== undefined && level?.delivery_lead_times?.length > 0) {
        const [delivery] = level.delivery_lead_times
        dispatch({
          type: 'setAvailability',
          payload: { ...delivery, quantity: level?.quantity },
        })
      } else if (config.accessToken && !item?.[sCode]) {
        getAvailability({ skuCode: sCode, config, dispatch, setItem })
      } else if (!available) {
        dispatch({
          type: 'setAvailability',
          payload: { quantity },
        })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {},
      })
    }
  }, [config.accessToken, item, sCode])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

AvailabilityContainer.propTypes = propTypes
AvailabilityContainer.displayName = displayName

export default AvailabilityContainer
