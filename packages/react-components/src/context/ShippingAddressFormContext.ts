import { createContext } from 'react'
import { DefaultContextAddress } from './BillingAddressFormContext'

const ShippingAddressFormContext = createContext<DefaultContextAddress>({})

export default ShippingAddressFormContext
