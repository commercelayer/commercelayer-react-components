import {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useState,
  useEffect,
  MouseEvent,
} from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'
import { LoaderType } from '#typings'
import getLoaderComponent from '../utils/getLoaderComponent'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import getPaypalConfig from '#utils/paypalPayment'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'

const propTypes = components.PaymentMethod.propTypes
const displayName = components.PaymentMethod.displayName

type THandleClick = (params: { payment?: PaymentMethodType | Record<string, any>, paymentSource?: Record<string, any> }) => void

type PaymentMethodProps = {
  children: ReactNode
  activeClass?: string
  loader?: LoaderType
  autoSelectSinglePaymentMethod?: boolean | (() => void)
} & Omit<JSX.IntrinsicElements['div'], 'onClick'> &
  (
    | {
        clickableContainer: true
        onClick?: THandleClick
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
  autoSelectSinglePaymentMethod,
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
    paymentSource,
    setPaymentSource,
    config
  } = useContext(PaymentMethodContext)
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
                const paymentMethodId = paymentMethod?.id as string
                const paymentResource = paymentMethod?.payment_source_type as PaymentResource
                await setPaymentMethod({ paymentResource, paymentMethodId })
                const attributes = config && paymentResource === 'paypal_payments'
                  ? getPaypalConfig(paymentResource, config)
                  : {}
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
      const paymentResource = payment?.payment_source_type as PaymentResource
      const onClickable = !clickableContainer
        ? undefined
        : async (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            setLoadingPlaceOrder({ loading: true })
            setPaymentSelected(payment.id)
            const paymentMethodId = payment?.id as string
            await setPaymentMethod({ paymentResource, paymentMethodId })
            onClick && onClick({ payment })
            setLoadingPlaceOrder({ loading: false })
          }
      return (
        <div
          data-test-id={paymentResource}
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
