import { createContext } from 'react'
import { variantInitialState } from '../reducers/VariantReducer'

const VariantContext = createContext(variantInitialState)

export default VariantContext
