import { useContext, useEffect, useReducer, useMemo, type JSX } from 'react';
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
  getCustomerInfo,
  type SetResourceTriggerParams,
  setResourceTrigger
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import CustomerContext from '#context/CustomerContext'
import type { BaseError } from '#typings/errors'
import type { DefaultChildrenType } from '#typings/globals'
import { isGuestToken } from '#utils/isGuestToken'
import type { QueryPageSize } from '@commercelayer/sdk'

interface Props {
  children: DefaultChildrenType
  /**
   * Customer type
   */
  isGuest?: boolean
  /**
   * The page size
   * default: 10
   */
  addressesPageSize?: QueryPageSize
}

/**
 * Main container for the Customers components.
 * It stores - in its context - the details of an active customer, if present.
 *
 * It also accept a `isGuest` prop to define if no customer is currently set as active.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<CustomerField>`,
 * `<CustomerInput>`,
 * `<SaveCustomerButton>`,
 * `<AddressesContainer>`,
 * `<AddressesEmpty>`,
 * `<CustomerPaymentSource>`,
 * `<CustomerPaymentSourceEmpty>`,
 * `<PaymentMethodsContainer>`,
 * `<OrdersList>`
 * </span>
 */
export function CustomerContainer(props: Props): JSX.Element {
  const { children, isGuest, addressesPageSize: pageSize } = props
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
          newResource: [
            'available_customer_payment_sources.payment_source',
            'available_customer_payment_sources.payment_method'
          ]
        })
      } else if (
        !includeLoaded?.['available_customer_payment_sources.payment_source']
      ) {
        addResourceToInclude({
          newResourceLoaded: {
            'available_customer_payment_sources.payment_source': true,
            'available_customer_payment_sources.payment_method': true
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
        getCustomerInfo({ config, dispatch })
      }
      if (state.addresses == null) {
        getCustomerAddresses({
          config,
          dispatch,
          isOrderAvailable: withoutIncludes != null,
          pageSize
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
        getCustomerData()
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
      setResourceTrigger: async (
        props: Omit<SetResourceTriggerParams, 'dispatch' | 'config'>
      ): Promise<boolean> => {
        // @ts-expect-error strange type error
        return await setResourceTrigger({
          ...props,
          dispatch,
          config
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
        pageSize?: QueryPageSize
      }) => {
        await getCustomerOrders({
          config,
          dispatch,
          pageNumber,
          pageSize
        })
      },
      getCustomerSubscriptions: async ({
        pageNumber,
        pageSize,
        id
      }: {
        pageNumber?: number
        pageSize?: QueryPageSize
        id?: string
      }) => {
        await getCustomerSubscriptions({
          config,
          dispatch,
          pageNumber,
          pageSize,
          id
        })
      },
      reloadCustomerAddresses: async () => {
        await getCustomerAddresses({
          config,
          dispatch,
          isOrderAvailable: withoutIncludes != null,
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
