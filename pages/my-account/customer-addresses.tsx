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
          <div className="flex flex-wrap mx-auto w-full">
            <Address className="w-1/3 p-2 border hover:border-blue-500 rounded m-2 shadow-sm">
              <div className="flex flex-col justify-between h-full">
                <div className="flex font-bold">
                  <AddressField name="first_name" />
                  <AddressField name="last_name" className="ml-1" />
                </div>
                <div>
                  <AddressField className="w-2/3" name="full_address" />
                </div>
                <div className="flex justify-between">
                  <div>
                    <AddressField
                      className="cursor-pointer"
                      type="edit"
                      label="Edit"
                      onClick={(id) => setAddressId(id)}
                    />
                  </div>
                  <div>
                    <AddressField
                      className="cursor-pointer"
                      type="delete"
                      label="Delete"
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </div>
            </Address>
          </div>
        </AddressesContainer>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
