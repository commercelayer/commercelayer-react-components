import { useContext, useEffect, useReducer } from 'react'
import customerReducer, {
  customerInitialState,
  getCustomerAddresses,
  getCustomerOrders,
  getCustomerPaymentSources,
  setCustomerEmail,
  setCustomerErrors,
  deleteCustomerAddress,
  createCustomerAddress,
  TCustomerAddress,
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { saveCustomerUser } from '#reducers/CustomerReducer'
import CustomerContext from '#context/CustomerContext'
import { BaseError } from '#typings/errors'

type Props = {
  children: JSX.Element[] | JSX.Element
  /**
   * Customer type
   */
  isGuest?: boolean
}

export function CustomerContainer(props: Props): JSX.Element {
  const { children, isGuest = false } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)
  const { order, addResourceToInclude, include, updateOrder, includeLoaded } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (
      !include?.includes('available_customer_payment_sources.payment_source') &&
      !isGuest
    ) {
      addResourceToInclude({
        newResource: 'available_customer_payment_sources.payment_source',
      })
    } else if (
      !includeLoaded?.['available_customer_payment_sources.payment_source'] &&
      !isGuest
    ) {
      addResourceToInclude({
        newResourceLoaded: {
          'available_customer_payment_sources.payment_source': true,
        },
      })
    }
  }, [include, includeLoaded])

  useEffect(() => {
    if (config.accessToken && state.addresses?.length === 0 && !isGuest) {
      void getCustomerAddresses({ config, dispatch })
    }
    if (order?.available_customer_payment_sources && !isGuest) {
      getCustomerPaymentSources({ dispatch, order })
    }
    if (config.accessToken && !order && !include && !includeLoaded) {
      void getCustomerOrders({ config, dispatch })
    }
  }, [config.accessToken, order, isGuest])
  const contextValue = {
    isGuest,
    ...state,
    saveCustomerUser: async (customerEmail: string) => {
      await saveCustomerUser({
        config,
        customerEmail,
        dispatch,
        updateOrder,
        order,
      })
    },
    setCustomerErrors: (errors: BaseError[]) =>
      setCustomerErrors(errors, dispatch),
    setCustomerEmail: (customerEmail: string) =>
      setCustomerEmail(customerEmail, dispatch),
    getCustomerPaymentSources: () =>
      getCustomerPaymentSources({ dispatch, order }),
    deleteCustomerAddress: ({
      customerAddressId,
    }: {
      customerAddressId: string
    }) =>
      deleteCustomerAddress({
        customerAddressId,
        dispatch,
        config,
        addresses: state.addresses,
      }),
    createCustomerAddress: (address: TCustomerAddress) =>
      createCustomerAddress({ address, config, dispatch, state }),
  }
  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}

export default CustomerContainer
