import React, {
  useContext,
  useReducer,
  FunctionComponent,
  useEffect,
  ReactNode,
} from 'react'
import availabilityReducer, {
  availabilityInitialState,
} from '../reducers/AvailabilityReducer'
import AvailabilityContext from '../context/AvailabilityContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import components from '../config/components'

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
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    const sCode = skuCode || getCurrentItemKey(item) || itemSkuCode
    if (sCode) {
      const firstLevel = _.first(item[sCode].inventory.levels) || {
        deliveryLeadTimes: [],
      }
      if (!_.isEmpty(firstLevel) && firstLevel.deliveryLeadTimes.length > 0) {
        const firstDelivery = _.first(firstLevel.deliveryLeadTimes)
        dispatch({
          type: 'setAvailability',
          payload: { ...firstDelivery },
        })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {},
      })
    }
  }, [item])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

AvailabilityContainer.propTypes = propTypes
AvailabilityContainer.displayName = displayName

export default AvailabilityContainer
