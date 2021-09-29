import {
  CommerceLayer,
  CustomerContainer,
  AddressesContainer,
  Address,
  AddressField,
} from '@commercelayer/react-components'
import { useState } from 'react'
import useGetToken from '../../hooks/useGetToken'

const OrdersList = () => {
  const config = useGetToken({ userMode: true })
  const [addressId, setAddressId] = useState('')
  console.log(`addressId`, addressId)
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <AddressesContainer>
          <Address className="w-1/2 p-2 border rounded m-2 shadow-sm">
            <div className="flex font-bold">
              <AddressField name="first_name" />
              <AddressField name="last_name" className="ml-1" />
            </div>
            <div>
              <AddressField name="full_address" />
            </div>
            <div>
              <AddressField
                type="edit"
                label="Edit"
                onClick={(id) => setAddressId(id)}
              />
            </div>
          </Address>
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
