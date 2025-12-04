import { type JSX, useEffect, useState } from "react"
import CustomerContext from "#context/CustomerContext"
import CustomerPaymentSourceContext from "#context/CustomerPaymentSourceContext"
import useCommerceLayer from "#hooks/useCommerceLayer"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import type { DefaultChildrenType } from "#typings/globals"
import getCardDetails from "#utils/getCardDetails"
import useCustomContext from "#utils/hooks/useCustomContext"

interface Props {
  children?: DefaultChildrenType
  /**
   * Customize the loader content.
   */
  loader?: string | JSX.Element
}

export function CustomerPaymentSource({
  children,
  loader = "Loading...",
}: Props): JSX.Element {
  const { sdkClient } = useCommerceLayer()
  const [loading, setLoading] = useState(true)
  const { payments, getCustomerPaymentSources } = useCustomContext({
    context: CustomerContext,
    contextComponentName: "CustomerContainer",
    currentComponentName: "CustomerPaymentSource",
    key: "payments",
  })
  useEffect(() => {
    if (payments != null) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [payments])

  const provider = payments
    ?.filter((p) => p?.payment_source != null)
    .map((p): JSX.Element => {
      const paymentType = p.payment_source?.type as PaymentResource
      const customerPayment = p
      const cardDetails = getCardDetails({ paymentType, customerPayment })
      const value = {
        ...cardDetails,
        handleDeleteClick: (e: MouseEvent) => {
          e?.preventDefault()
          e?.stopPropagation()
          const sdk = sdkClient()
          if (sdk == null) return
          sdk.customer_payment_sources.delete(p.id).then(() => {
            if (getCustomerPaymentSources) {
              getCustomerPaymentSources()
            }
          })
        },
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
