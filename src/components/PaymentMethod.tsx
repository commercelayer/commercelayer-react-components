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
}

const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({ children }) => {
  const { paymentMethods } = useContext(PaymentMethodContext)
  const components =
    paymentMethods &&
    paymentMethods.map((payment, k) => {
      const paymentMethodProps = {
        payment,
      }
      return (
        <PaymentMethodChildrenContext.Provider
          key={k}
          value={paymentMethodProps}
        >
          {children}
        </PaymentMethodChildrenContext.Provider>
      )
    })
  return <Fragment>{components}</Fragment>
}

PaymentMethod.propTypes = propTypes
PaymentMethod.displayName = displayName

export default PaymentMethod
