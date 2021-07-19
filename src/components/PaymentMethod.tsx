import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'
import { LoaderType } from '#typings'
import getLoaderComponent from '../utils/getLoaderComponent'

const propTypes = components.PaymentMethod.propTypes
const displayName = components.PaymentMethod.displayName

type PaymentMethodProps = {
  children: ReactNode
  activeClass?: string
  loader?: LoaderType
} & JSX.IntrinsicElements['div']

const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
  children,
  className,
  activeClass,
  loader = 'Loading...',
  ...p
}) => {
  const [loading, setLoading] = useState(true)
  const { paymentMethods, currentPaymentMethodId } =
    useContext(PaymentMethodContext)
  useEffect(() => {
    if (paymentMethods) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [paymentMethods])
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
  return !loading ? (
    <Fragment>{components}</Fragment>
  ) : (
    getLoaderComponent(loader)
  )
}

PaymentMethod.propTypes = propTypes
PaymentMethod.displayName = displayName

export default PaymentMethod
