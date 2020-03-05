import React, {
  useContext,
  useReducer,
  FunctionComponent,
  useEffect
} from 'react'
import availabilityReducer, {
  availabilityInitialState
} from '../reducers/AvailabilityReducer'
import AvailabilityContext from '../context/AvailabilityContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import PropTypes, { InferProps } from 'prop-types'

const ACProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string
}

export type AvailabilityContainerProps = InferProps<typeof ACProps>

const AvailabilityContainer: FunctionComponent<AvailabilityContainerProps> = props => {
  const { children } = props
  const { item } = useContext(ItemContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    const skuCode = props.skuCode || getCurrentItemKey(item)
    if (skuCode) {
      const firstLevel = _.first(item[skuCode].inventory.levels)
      if (firstLevel.deliveryLeadTimes.length > 0) {
        const firstDelivery = _.first(firstLevel.deliveryLeadTimes)
        dispatch({
          type: 'setAvailability',
          payload: { ...firstDelivery }
        })
      }
    }
    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {}
      })
    }
  }, [item])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

AvailabilityContainer.propTypes = ACProps

export default AvailabilityContainer
