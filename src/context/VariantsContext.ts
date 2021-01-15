import { createContext } from 'react'
import { variantInitialState } from '#reducers/VariantReducer'

const VariantsContext = createContext(variantInitialState)

export default VariantsContext
