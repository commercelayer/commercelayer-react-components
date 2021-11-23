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
import { isEmpty } from 'lodash'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import components from '#config/components'
import CommerceLayerContext from '#context/CommerceLayerContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'

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
  const { item, skuCode: itemSkuCode } = useContext(ItemContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    const sCode =
      skuCode || getCurrentItemKey(item) || itemSkuCode || lineItem?.sku_code
    if (sCode) {
      const [level] = item[sCode]?.inventory?.levels || {
        quantity: null,
        delivery_lead_times: [],
      }
      if (!isEmpty(level) && level?.delivery_lead_times?.length > 0) {
        const [delivery] = level?.delivery_lead_times
        dispatch({
          type: 'setAvailability',
          payload: { ...delivery, quantity: level?.quantity },
        })
      } else if (config.accessToken) {
        getAvailability({ skuCode: sCode, config, dispatch })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {},
      })
    }
  }, [config.accessToken, item, itemSkuCode])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

AvailabilityContainer.propTypes = propTypes
AvailabilityContainer.displayName = displayName

export default AvailabilityContainer
