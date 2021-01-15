import { createContext } from 'react'
import { availabilityInitialState } from '#reducers/AvailabilityReducer'

const AvailabilityContext = createContext(availabilityInitialState)

export default AvailabilityContext
