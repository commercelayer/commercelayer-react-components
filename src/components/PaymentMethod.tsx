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
import { PaymentMethodCollection } from '@commercelayer/js-sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'

const propTypes = components.PaymentMethod.propTypes
const displayName = components.PaymentMethod.displayName

type PaymentMethodProps = {
  children: ReactNode
  activeClass?: string
  loader?: LoaderType
} & Omit<JSX.IntrinsicElements['div'], 'onClick'> &
  (
    | {
        clickableContainer: true
        onClick?: (
          payment?: PaymentMethodCollection | Record<string, any>
        ) => void
      }
    | {
        clickableContainer?: never
        onClick?: never
      }
  )

const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
  children,
  className,
  activeClass,
  loader = 'Loading...',
  clickableContainer,
  onClick,
  ...p
}) => {
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState('')
  const {
    paymentMethods,
    currentPaymentMethodId,
    setPaymentMethod,
    setLoading: setLoadingPlaceOrder,
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (paymentMethods) setLoading(false)
    if (currentPaymentMethodId) setPaymentSelected(currentPaymentMethodId)
    return () => {
      setLoading(true)
    }
  }, [paymentMethods, currentPaymentMethodId])
  const components =
    paymentMethods &&
    paymentMethods.map((payment, k) => {
      const isActive = currentPaymentMethodId === payment?.id
      const paymentMethodProps = {
        payment,
        clickableContainer,
        paymentSelected,
        setPaymentSelected,
      }
      const onClickable = !clickableContainer
        ? undefined
        : async () => {
            setLoadingPlaceOrder({ loading: true })
            setPaymentSelected(payment.id)
            const paymentResource =
              payment?.paymentSourceType as PaymentResource
            const paymentMethodId = payment?.id as string
            await setPaymentMethod({ paymentResource, paymentMethodId })
            onClick && onClick(payment)
            setLoadingPlaceOrder({ loading: false })
          }
      return (
        <div
          key={k}
          className={`${className} ${isActive ? activeClass : ''}`}
          onClick={onClickable}
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
