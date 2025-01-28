import {
  useState,
  useEffect,
  type MouseEvent,
  useContext,
  type JSX
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import type { LoaderType } from '#typings'
import getLoaderComponent from '#utils/getLoaderComponent'
import type {
  Order,
  PaymentMethod as PaymentMethodType
} from '@commercelayer/sdk'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { DefaultChildrenType } from '#typings/globals'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import {
  getExternalPaymentAttributes,
  getPaypalAttributes
} from '#utils/getPaymentAttributes'
import { isEmpty } from '#utils/isEmpty'
import { getAvailableExpressPayments } from '#utils/expressPaymentHelper'
import PlaceOrderContext from '#context/PlaceOrderContext'
import { sortPaymentMethods } from '#utils/payment-methods/sortPaymentMethods'

export interface PaymentMethodOnClickParams {
  payment?: PaymentMethodType | Record<string, any>
  order?: Order
  paymentSource?: Order['payment_source']
}

type Props = {
  /**
   * Hide payment methods by an array of strings or a function that returns a boolean
   */
  hide?: PaymentResource[] | ((payment: PaymentMethodType) => boolean)
  children: DefaultChildrenType
  /**
   * Set CSS classes when the payment method is selected
   */
  activeClass?: string
  /**
   * Customize the loader component
   */
  loader?: LoaderType
  /**
   * Auto select the payment method when there is only one available
   */
  autoSelectSinglePaymentMethod?: boolean | (() => void)
  /**
   * Enable express payment. Other payment methods will be disabled.
   */
  expressPayments?: boolean
  /**
   * Sort payment methods by an array of strings
   */
  sortBy?: Array<PaymentMethodType['payment_source_type']>
} & Omit<JSX.IntrinsicElements['div'], 'onClick' | 'children'> &
  (
    | {
        clickableContainer: true
        onClick?: (params: PaymentMethodOnClickParams) => void
      }
    | {
        clickableContainer?: never
        onClick?: never
      }
  )

let loadingResource = false

export function PaymentMethod({
  children,
  className,
  activeClass,
  loader = 'Loading...',
  clickableContainer,
  autoSelectSinglePaymentMethod,
  expressPayments,
  hide,
  onClick,
  sortBy,
  ...p
}: Props): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState('')
  const [paymentSourceCreated, setPaymentSourceCreated] = useState(false)
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
  const { status } = useContext(PlaceOrderContext)
  useEffect(() => {
    if (paymentMethods != null && !isEmpty(paymentMethods) && expressPayments) {
      const [paymentMethod] = getAvailableExpressPayments(paymentMethods)
      if (!paymentSource && paymentMethod != null) {
        const selectExpressPayment = async (): Promise<void> => {
          setLoadingPlaceOrder({ loading: true })
          setPaymentSelected(paymentMethod.id)
          const paymentMethodId = paymentMethod?.id
          const paymentResource =
            paymentMethod?.payment_source_type as PaymentResource
          await setPaymentMethod({ paymentResource, paymentMethodId })
          const ps = await setPaymentSource({
            paymentResource,
            order
          })
          if (ps && paymentMethod && onClick != null) {
            onClick({ payment: paymentMethod, order, paymentSource: ps })
            setTimeout(() => {
              setLoading(false)
            }, 200)
          }
          setLoadingPlaceOrder({ loading: false })
        }
        selectExpressPayment()
      }
    }
  }, [!isEmpty(paymentMethods), expressPayments])
  useEffect(() => {
    if (
      paymentMethods != null &&
      !paymentSourceCreated &&
      !loadingResource &&
      !isEmpty(paymentMethods)
    ) {
      loadingResource = true
      if (autoSelectSinglePaymentMethod != null && !expressPayments) {
        const autoSelect = async (): Promise<void> => {
          const isSingle = paymentMethods.length === 1
          if (isSingle) {
            const [paymentMethod] = paymentMethods ?? []
            if (paymentMethod && !paymentSource) {
              setLoadingPlaceOrder({ loading: true })
              setPaymentSelected(paymentMethod.id)
              const paymentMethodId = paymentMethod?.id
              const paymentResource =
                paymentMethod?.payment_source_type as PaymentResource
              await setPaymentMethod({ paymentResource, paymentMethodId })
              let attributes: Record<string, unknown> | undefined = {}
              if (config != null && paymentResource === 'paypal_payments') {
                attributes = getPaypalAttributes(paymentResource, config)
              }
              if (config != null && paymentResource === 'external_payments') {
                attributes = getExternalPaymentAttributes(
                  paymentResource,
                  config
                )
              }
              const ps = await setPaymentSource({
                paymentResource,
                order,
                attributes
              })
              if (ps && paymentMethod && onClick != null) {
                setPaymentSourceCreated(true)
                onClick({ payment: paymentMethod, order, paymentSource: ps })
                setTimeout(() => {
                  setLoading(false)
                }, 200)
              }
              if (getCustomerPaymentSources) {
                getCustomerPaymentSources()
              }
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
  }, [!isEmpty(paymentMethods), order?.payment_source != null])
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
      setPaymentSelected('')
    }
  }, [paymentMethods, currentPaymentMethodId])

  const sortedPaymentMethods =
    paymentMethods != null && sortBy != null
      ? sortPaymentMethods(paymentMethods, sortBy)
      : paymentMethods

  const components = sortedPaymentMethods
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
        setPaymentSelected,
        expressPayments
      }
      const paymentResource = payment?.payment_source_type as PaymentResource
      const onClickable = !clickableContainer
        ? undefined
        : async (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            const paymentMethodId = payment?.id
            const currentPaymentMethodId = order?.payment_method?.id
            if (paymentMethodId === currentPaymentMethodId) return
            if (status === 'placing') return
            setLoadingPlaceOrder({ loading: true })
            setPaymentSelected(payment.id)
            const { order: updatedOrder } = await setPaymentMethod({
              paymentResource,
              paymentMethodId
            })
            if (onClick) onClick({ payment, order: updatedOrder })
            setLoadingPlaceOrder({ loading: false })
          }
      return (
        <div
          data-testid={paymentResource}
          key={k}
          className={`${className ?? ''} ${
            isActive && activeClass != null ? activeClass : ''
          }`}
          onClick={(e) => {
            if (onClickable != null) {
              onClickable(e)
            }
          }}
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
