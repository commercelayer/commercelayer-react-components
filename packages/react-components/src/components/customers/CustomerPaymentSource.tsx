import CustomerContext from '#context/CustomerContext'
import CustomerPaymentSourceContext from '#context/CustomerPaymentSourceContext'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import type { DefaultChildrenType } from '#typings/globals'
import getCardDetails from '#utils/getCardDetails'
import useCustomContext from '#utils/hooks/useCustomContext'
import { useEffect, useState, type JSX } from 'react';

interface Props {
  children?: DefaultChildrenType
  /**
   * Customize the loader content.
   */
  loader?: string | JSX.Element
}

export function CustomerPaymentSource({
  children,
  loader = 'Loading...'
}: Props): JSX.Element {
  const [loading, setLoading] = useState(true)
  const { payments } = useCustomContext({
    context: CustomerContext,
    contextComponentName: 'CustomerContainer',
    currentComponentName: 'CustomerPaymentSource',
    key: 'payments'
  })
  useEffect(() => {
    if (payments != null) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [payments != null])

  const provider = payments
    ?.filter((p) => p?.payment_source != null)
    .map((p): JSX.Element => {
      const paymentType = p.payment_source?.type as PaymentResource
      const customerPayment = p
      const cardDetails = getCardDetails({ paymentType, customerPayment })
      const value = {
        ...cardDetails
      }
      return (
        <CustomerPaymentSourceContext.Provider key={p.id} value={value}>
          {children}
        </CustomerPaymentSourceContext.Provider>
      )
    })
  return loading ? <>{loader}</> : <>{provider}</>
}

export default CustomerPaymentSource
