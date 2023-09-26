import { useContext, useEffect, useReducer, useMemo } from 'react'
import customerReducer, {
  customerInitialState,
  getCustomerAddresses,
  getCustomerOrders,
  getCustomerPaymentSources,
  setCustomerEmail,
  setCustomerErrors,
  deleteCustomerAddress,
  createCustomerAddress,
  type TCustomerAddress,
  saveCustomerUser,
  getCustomerPayments,
  getCustomerSubscriptions,
  getCustomerInfo
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import CustomerContext from '#context/CustomerContext'
import type { BaseError } from '#typings/errors'
import type { DefaultChildrenType } from '#typings/globals'
import { isGuestToken } from '#utils/isGuestToken'

interface Props {
  children: DefaultChildrenType
  /**
   * Customer type
   */
  isGuest?: boolean
}

/**
 * The CustomerContainer component manages the customer state.
 */
export function CustomerContainer(props: Props): JSX.Element {
  const { children, isGuest } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)
  const {
    order,
    addResourceToInclude,
    include,
    updateOrder,
    includeLoaded,
    withoutIncludes
  } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (config.accessToken) {
      const guestToken =
        isGuest == null ? isGuestToken(config.accessToken) : isGuest
      if (guestToken) {
        return
      }
      if (
        !include?.includes('available_customer_payment_sources.payment_source')
      ) {
        addResourceToInclude({
          newResource: 'available_customer_payment_sources.payment_source'
        })
      } else if (
        !includeLoaded?.['available_customer_payment_sources.payment_source']
      ) {
        addResourceToInclude({
          newResourceLoaded: {
            'available_customer_payment_sources.payment_source': true
          }
        })
      }
    }
  }, [
    config.accessToken,
    include?.length,
    Object.keys(includeLoaded ?? {}).length
  ])

  useEffect(() => {
    if (config.accessToken) {
      const guestToken =
        isGuest == null ? isGuestToken(config.accessToken) : isGuest
      if (guestToken) {
        return
      }
      if (state.customers == null) {
        void getCustomerInfo({ config, dispatch })
      }
      if (state.addresses == null) {
        void getCustomerAddresses({
          config,
          dispatch,
          isOrderAvailable: withoutIncludes != null
        })
      }
      if (order?.available_customer_payment_sources) {
        getCustomerPaymentSources({ dispatch, order })
      }
      if (
        config.accessToken &&
        order == null &&
        include == null &&
        includeLoaded == null &&
        withoutIncludes === undefined
      ) {
        async function getCustomerData(): Promise<void> {
          await getCustomerOrders({ config, dispatch })
          await getCustomerSubscriptions({ config, dispatch })
          await getCustomerPayments({ config, dispatch })
        }
        void getCustomerData()
      }
    }
  }, [config.accessToken, order?.payment_source != null, isGuest])
  const contextValue = useMemo(() => {
    return {
      isGuest,
      ...state,
      saveCustomerUser: async (customerEmail: string) => {
        await saveCustomerUser({
          config,
          customerEmail,
          dispatch,
          updateOrder,
          order
        })
      },
      setCustomerErrors: (errors: BaseError[]) => {
        setCustomerErrors(errors, dispatch)
      },
      setCustomerEmail: (customerEmail: string) => {
        setCustomerEmail(customerEmail, dispatch)
      },
      getCustomerPaymentSources: () => {
        getCustomerPaymentSources({ dispatch, order })
      },
      deleteCustomerAddress: async ({
        customerAddressId
      }: {
        customerAddressId: string
      }) => {
        await deleteCustomerAddress({
          customerAddressId,
          dispatch,
          config,
          addresses: state.addresses
        })
      },
      createCustomerAddress: async (address: TCustomerAddress) => {
        await createCustomerAddress({ address, config, dispatch, state })
      },
      getCustomerOrders: async ({
        pageNumber,
        pageSize
      }: {
        pageNumber?: number
        pageSize?: number
      }) => {
        await getCustomerOrders({
          config,
          dispatch,
          pageNumber,
          pageSize
        })
      }
    }
  }, [state, isGuest])
  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}

export default CustomerContainer
