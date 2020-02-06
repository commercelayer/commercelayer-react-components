import { createContext } from 'react'
import { AvailabilityState } from '../../reducers/AvailabilityReducer'

const initial: AvailabilityState = {}

const AvailabilityContext = createContext(initial)

export default AvailabilityContext
