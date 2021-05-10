import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'

const propTypes = components.PaymentMethod.propTypes
const displayName = components.PaymentMethod.displayName

type PaymentMethodProps = {
  children: ReactNode
  activeClass?: string
} & JSX.IntrinsicElements['div']

const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
  children,
  className,
  activeClass,
  ...p
}) => {
  const { paymentMethods, currentPaymentMethodId } = useContext(
    PaymentMethodContext
  )
  const components =
    paymentMethods &&
    paymentMethods.map((payment, k) => {
      const isActive = currentPaymentMethodId === payment?.id
      const paymentMethodProps = {
        payment,
      }
      return (
        <div
          key={k}
          className={`${className} ${isActive ? activeClass : ''}`}
          {...p}
        >
          <PaymentMethodChildrenContext.Provider value={paymentMethodProps}>
            {children}
          </PaymentMethodChildrenContext.Provider>
        </div>
      )
    })
  return <Fragment>{components}</Fragment>
}

PaymentMethod.propTypes = propTypes
PaymentMethod.displayName = displayName

export default PaymentMethod
