import React, {
  useContext,
  useReducer,
  FunctionComponent,
  useEffect,
} from 'react'
import availabilityReducer, {
  availabilityInitialState,
} from '../reducers/AvailabilityReducer'
import AvailabilityContext from '../context/AvailabilityContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import { InferProps } from 'prop-types'
import components from '../config/components'

const propTypes = components.AvailabilityContainer.propTypes
const displayName = components.AvailabilityContainer.displayName

export type AvailabilityContainerProps = InferProps<typeof propTypes>

const AvailabilityContainer: FunctionComponent<AvailabilityContainerProps> = (
  props
) => {
  const { children } = props
  const { item, skuCode: itemSkuCode } = useContext(ItemContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    const skuCode = props.skuCode || getCurrentItemKey(item) || itemSkuCode
    if (skuCode) {
      const firstLevel = _.first(item[skuCode].inventory.levels) || {
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
