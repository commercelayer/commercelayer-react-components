import React, {
  useContext,
  ReactNode,
  useReducer,
  FunctionComponent,
  useEffect
} from 'react'
import VariantContext from '../context/VariantContext'
import availabilityReducer, {
  availabilityInitialState
} from '../reducers/AvailabilityReducer'
import AvailabilityContext from '../context/AvailabilityContext'
import _ from 'lodash'

export interface AvailabilityContainerProps {
  children: ReactNode
  skuId?: string
}

const AvailabilityContainer: FunctionComponent<AvailabilityContainerProps> = props => {
  const { children } = props
  const { currentSkuInventory } = useContext(VariantContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  useEffect(() => {
    if (currentSkuInventory.levels.length > 0) {
      const firstLevel = _.first(currentSkuInventory.levels)
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
  }, [currentSkuInventory])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export default AvailabilityContainer
