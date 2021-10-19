import CustomerField from '#components/CustomerField'
import {
  CommerceLayer,
  CustomerContainer,
} from '@commercelayer/react-components'
import React from 'react'
import useGetToken from '../../hooks/useGetToken'

const OrdersList = () => {
  const config = useGetToken({ userMode: true })
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <CustomerField name="email" />
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
