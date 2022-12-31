import { ReactNode, useState, useEffect, MouseEvent } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import { LoaderType } from '#typings'
import getLoaderComponent from '../../utils/getLoaderComponent'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import useCustomContext from '#utils/hooks/useCustomContext'

type Props = {
  /**
   * Hide payment methods by an array of strings
   */
  hide?: (paymentMethod: PaymentMethodType) => boolean
  children: ReactNode
  activeClass?: string
  loader?: LoaderType
} & Omit<JSX.IntrinsicElements['div'], 'onClick'> &
  (
    | {
        clickableContainer: true
        onClick?: (payment?: PaymentMethodType | Record<string, any>) => void
      }
    | {
        clickableContainer?: never
        onClick?: never
      }
  )

export function PaymentMethod({
  children,
  className,
  activeClass,
  loader = 'Loading...',
  clickableContainer,
  hide,
  onClick,
  ...p
}: Props): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState('')
  const {
    paymentMethods,
    currentPaymentMethodId,
    setPaymentMethod,
    setLoading: setLoadingPlaceOrder
  } = useCustomContext({
    context: PaymentMethodContext,
    contextComponentName: 'PaymentMethodsContainer',
    currentComponentName: 'PaymentMethod',
    key: 'paymentMethods'
  })
  useEffect(() => {
    if (paymentMethods) setLoading(false)
    if (currentPaymentMethodId) setPaymentSelected(currentPaymentMethodId)
    return () => {
      setLoading(true)
    }
  }, [paymentMethods, currentPaymentMethodId])
  const components = paymentMethods
    ?.filter((paymentMethod) => (hide ? hide(paymentMethod) : true))
    .map((payment, k) => {
      const isActive = currentPaymentMethodId === payment?.id
      const paymentMethodProps = {
        payment,
        clickableContainer,
        paymentSelected,
        setPaymentSelected
      }
      const paymentResource = payment?.payment_source_type as PaymentResource
      const onClickable = !clickableContainer
        ? undefined
        : async (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            setLoadingPlaceOrder({ loading: true })
            setPaymentSelected(payment.id)
            const paymentMethodId = payment?.id
            await setPaymentMethod({ paymentResource, paymentMethodId })
            if (onClick) onClick(payment)
            setLoadingPlaceOrder({ loading: false })
          }
      return (
        <div
          data-test-id={paymentResource}
          key={k}
          className={`${className ?? ''} ${
            isActive && activeClass != null ? activeClass : ''
          }`}
          onClick={onClickable}
          {...p}
        >
          <PaymentMethodChildrenContext.Provider value={paymentMethodProps}>
            {children}
          </PaymentMethodChildrenContext.Provider>
        </div>
      )
    })
  return !loading ? <>{components}</> : getLoaderComponent(loader)
}

export default PaymentMethod
