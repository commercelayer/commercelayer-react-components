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
import { isEmpty, first } from 'lodash'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import components from '#config/components'
import CommerceLayerContext from '#context/CommerceLayerContext'

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
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    const sCode = skuCode || getCurrentItemKey(item) || itemSkuCode
    if (sCode) {
      const firstLevel = first(item[sCode]?.inventory?.levels) || {
        quantity: null,
        deliveryLeadTimes: [],
      }
      if (!isEmpty(firstLevel) && firstLevel.deliveryLeadTimes.length > 0) {
        const firstDelivery = first(firstLevel.deliveryLeadTimes)
        dispatch({
          type: 'setAvailability',
          payload: { ...firstDelivery, quantity: firstLevel?.quantity },
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
