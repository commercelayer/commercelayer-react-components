import { createContext } from 'react'
import type { DefaultContextAddress } from './BillingAddressFormContext'

const ShippingAddressFormContext = createContext<DefaultContextAddress>({})

export default ShippingAddressFormContext
