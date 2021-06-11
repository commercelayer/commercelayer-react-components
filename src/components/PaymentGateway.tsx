import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
} from 'react'
// import BraintreePayment from './BraintreePayment'
import { PaymentSourceProps } from './PaymentSource'
import StripePayment from './StripePayment'
import Parent from './utils/Parent'
import WireTransferPayment from './WireTransferPayment'

type PaymentGatewayProps = PaymentSourceProps & {
  showCard: boolean
  handleEditClick: () => void
  show: boolean
}

const PaymentGateway: FunctionComponent<PaymentGatewayProps> = ({
  readonly,
  showCard,
  handleEditClick,
  children,
  templateCustomerCards,
  templateCustomerSaveToWallet,
  show,
  ...p
}) => {
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { order } = useContext(OrderContext)
  const {
    currentPaymentMethodId,
    config,
    paymentSource,
    currentPaymentMethodType,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const paymentResource = readonly
    ? currentPaymentMethodType
    : (payment?.paymentSourceType as PaymentResource)
  useEffect(() => {
    if (
      paymentResource &&
      !paymentSource &&
      payment?.id === currentPaymentMethodId &&
      order
    ) {
      setPaymentSource({
        paymentResource,
        order,
      })
    }
  }, [paymentSource, payment, show])
  switch (paymentResource) {
    case 'stripe_payments':
      if (!readonly && payment?.id !== currentPaymentMethodId) return null
      const locale = order?.languageCode as StripeElementLocale
      // @ts-ignore
      const publishableKey = paymentSource?.publishableKey
      const stripeConfig = config
        ? getPaymentConfig<'stripePayment'>(paymentResource, config)
        : {}
      const customerPayments =
        !isEmpty(payments) && payments
          ? payments.filter((customerPayment) => {
              return customerPayment.paymentSourceType === 'StripePayment'
            })
          : []
      if (readonly || showCard) {
        // @ts-ignore
        const card = paymentSource?.options?.card as Record<string, any>
        const value = { ...card, showCard, handleEditClick, readonly }
        return isEmpty(card) ? null : (
          <PaymentSourceContext.Provider value={value}>
            {children}
          </PaymentSourceContext.Provider>
        )
      }
      if (!isGuest && templateCustomerCards) {
        const customerPaymentsCards = customerPayments.map(
          (customerPayment, i) => {
            // @ts-ignore
            const card = customerPayment?.paymentSource()?.options
              ?.card as Record<string, any>
            const handleClick = async () => {
              await setPaymentSource({
                paymentResource,
                customerPaymentSourceId: customerPayment.id,
              })
            }
            const value = {
              ...card,
              showCard,
              handleEditClick,
              readonly,
              handleClick,
            }
            return (
              <PaymentSourceContext.Provider key={i} value={value}>
                <Parent {...value}>{templateCustomerCards}</Parent>
              </PaymentSourceContext.Provider>
            )
          }
        )
        return (
          <Fragment>
            {isEmpty(customerPaymentsCards) ? null : (
              <div className={p.className}>{customerPaymentsCards}</div>
            )}
            <StripePayment
              show={show}
              templateCustomerSaveToWallet={templateCustomerSaveToWallet}
              publishableKey={publishableKey}
              locale={locale}
              {...stripeConfig}
            />
          </Fragment>
        )
      }
      return publishableKey ? (
        <StripePayment
          show={show}
          publishableKey={publishableKey}
          locale={locale}
          {...stripeConfig}
        />
      ) : null
    case 'braintree_payments':
      if (payment?.id !== currentPaymentMethodId) return null
      // @ts-ignore
      // const authorization = paymentSource?.clientToken
      // const braintreeCustomerPayments =
      //   !isEmpty(payments) && payments
      //     ? payments.filter((customerPayment) => {
      //         return customerPayment.paymentSourceType === 'BraintreePayment'
      //       })
      //     : []
      // console.table([braintreeCustomerPayments, showCard])
      // if (readonly || showCard) {
      //   // @ts-ignore
      //   const card = paymentSource?.options?.card as Record<string, any>
      //   const value = { ...card, showCard, handleEditClick, readonly }
      //   return isEmpty(card) ? null : (
      //     <PaymentSourceContext.Provider value={value}>
      //       {children}
      //     </PaymentSourceContext.Provider>
      //   )
      // }
      // if (!isGuest && templateCustomerCards) {
      //   const customerPaymentsCards = braintreeCustomerPayments.map(
      //     (customerPayment, i) => {
      //       // @ts-ignore
      //       const card = customerPayment?.paymentSource()?.options
      //         ?.card as Record<string, any>
      //       const handleClick = async () => {
      //         await setPaymentSource({
      //           paymentResource,
      //           customerPaymentSourceId: customerPayment.id,
      //         })
      //       }
      //       const value = {
      //         ...card,
      //         showCard,
      //         handleEditClick,
      //         readonly,
      //         handleClick,
      //       }
      //       return (
      //         <PaymentSourceContext.Provider key={i} value={value}>
      //           <Parent {...value}>{templateCustomerCards}</Parent>
      //         </PaymentSourceContext.Provider>
      //       )
      //     }
      //   )
      //   return !authorization ? null : (
      //     <Fragment>
      //       {isEmpty(customerPaymentsCards) ? null : (
      //         <div className={p.className}>{customerPaymentsCards}</div>
      //       )}
      //       <BraintreePayment
      //         // show={show}
      //         // templateCustomerSaveToWallet={templateCustomerSaveToWallet}
      //         authorization={authorization}
      //         // locale={locale}
      //       />
      //     </Fragment>
      //   )
      // }
      // return !authorization ? null : (
      //   <BraintreePayment authorization={authorization} />
      // )
      return null
    case 'wire_transfers':
      if (payment?.id !== currentPaymentMethodId) return null
      if (readonly || showCard) {
        const card =
          // @ts-ignore
          paymentSource?.options?.card ||
          // @ts-ignore
          (paymentSource?.metadata?.card as Record<string, any>)
        const value = { ...card, showCard, handleEditClick, readonly }
        return isEmpty(card) ? null : (
          <PaymentSourceContext.Provider value={value}>
            {children}
          </PaymentSourceContext.Provider>
        )
      }
      const wireTransferConfig =
        config && paymentResource
          ? getPaymentConfig<'wireTransfer'>(paymentResource, config)
          : {}
      return <WireTransferPayment {...p} {...wireTransferConfig} />
    default:
      return null
  }
}

export default PaymentGateway
