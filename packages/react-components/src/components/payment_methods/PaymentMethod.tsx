import { useState, useEffect, MouseEvent, useContext } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import { LoaderType } from '#typings'
import getLoaderComponent from '../../utils/getLoaderComponent'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { DefaultChildrenType } from '#typings/globals'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import { getExternalPaymentAttributes, getPaypalAttributes } from '#utils/getPaymentAttributes'

type Props = {
  /**
   * Hide payment methods by an array of strings or a function that returns a boolean
   */
  hide?: PaymentResource[] | ((payment: PaymentMethodType) => boolean)
  children: DefaultChildrenType
  activeClass?: string
  loader?: LoaderType
  autoSelectSinglePaymentMethod?: boolean | (() => void)
} & Omit<JSX.IntrinsicElements['div'], 'onClick' | 'children'> &
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
  autoSelectSinglePaymentMethod,
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
    setLoading: setLoadingPlaceOrder,
    paymentSource,
    setPaymentSource,
    config
  } = useCustomContext({
    context: PaymentMethodContext,
    contextComponentName: 'PaymentMethodsContainer',
    currentComponentName: 'PaymentMethod',
    key: 'paymentMethods'
  })
  const { order } = useContext(OrderContext)
  const { getCustomerPaymentSources } = useContext(CustomerContext)
  useEffect(() => {
    if (paymentMethods != null) {
      if (autoSelectSinglePaymentMethod != null) {
        const autoSelect = async () => {
          const isSingle = paymentMethods.length === 1
          if (isSingle) {
            const [paymentMethod] = paymentMethods ?? []
            if (paymentMethod && !paymentSource) {
                setLoadingPlaceOrder({ loading: true })
                setPaymentSelected(paymentMethod.id)
                const paymentMethodId = paymentMethod?.id
                const paymentResource = paymentMethod?.payment_source_type as PaymentResource
                await setPaymentMethod({ paymentResource, paymentMethodId })
                let attributes: Record<string, unknown> | undefined = {}
                if (config != null && paymentResource === 'paypal_payments') {
                  attributes = getPaypalAttributes(paymentResource, config)
                }
                if (config != null && paymentResource === 'external_payments') {
                  attributes = getExternalPaymentAttributes(paymentResource, config)
                }
                const ps = await setPaymentSource({
                  paymentResource,
                  order,
                  attributes,
                })
                if (ps && paymentMethod && onClick != null) {
                  onClick({ payment: paymentMethod, paymentSource: ps })
                  setTimeout(() => {
                    setLoading(false)
                  }, 200)
                }
                if (getCustomerPaymentSources) (await getCustomerPaymentSources())
                setLoadingPlaceOrder({ loading: false })
              }
              if (typeof autoSelectSinglePaymentMethod === 'function') {
                autoSelectSinglePaymentMethod()
              }
          } else {
            setTimeout(() => {
              setLoading(false)
            }, 200)
          }
        }
        autoSelect()
      }
    }
  }, [paymentMethods])
  useEffect(() => {
    if (paymentMethods) { 
      const isSingle = paymentMethods.length === 1
      if (isSingle && autoSelectSinglePaymentMethod) {
        if (paymentSource) {
          setTimeout(() => {
            setLoading(false)
          }, 200)
        }
      } else {
        setLoading(false)
      }
    }
    if (currentPaymentMethodId) setPaymentSelected(currentPaymentMethodId)
    return () => {
      setLoading(true)
    }
  }, [paymentMethods, currentPaymentMethodId])
  const components = paymentMethods
    ?.filter((payment) => {
      if (Array.isArray(hide)) {
        const source = payment?.payment_source_type as PaymentResource
        return !hide?.includes(source)
      } else if (typeof hide === 'function') {
        return hide(payment)
      }
      return true
    })
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
