import {
  CommerceLayer,
  CustomerContainer,
  CustomerField,
} from 'packages/react-components/src'
import useGetToken from '../../hooks/useGetToken'

const OrdersList = () => {
  const config = useGetToken({ userMode: true })
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <CustomerField attribute="email" tagElement="p" />
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
