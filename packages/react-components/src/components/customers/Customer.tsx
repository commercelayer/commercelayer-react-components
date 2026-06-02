import {
  createCustomerAddress as coreCreateCustomerAddress,
  deleteCustomerAddress as coreDeleteCustomerAddress,
  deleteCustomerPayment as coreDeleteCustomerPayment,
  getCustomerAddresses as coreGetCustomerAddresses,
  getCustomerInfo as coreGetCustomerInfo,
  getCustomerOrders as coreGetCustomerOrders,
  getCustomerPaymentSources as coreGetCustomerPaymentSources,
  getCustomerPayments as coreGetCustomerPayments,
  getCustomerSubscriptions as coreGetCustomerSubscriptions,
  saveCustomerUser as coreSaveCustomerUser,
  setResourceTrigger as coreSetResourceTrigger,
  type InterceptorManager,
  type Order,
  type QueryPageSize,
} from "@commercelayer/core"
import { type JSX, useContext, useEffect, useMemo, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { type defaultOrderContext } from "#context/OrderContext"
import type {
  CustomerState,
  DeleteCustomerAddressParams,
  DeleteCustomerPaymentParams,
  GetCustomerOrdersParams,
  GetCustomerSubscriptionsParams,
  SetResourceTriggerParams,
  TCustomerAddress,
} from "#typings/customers"
import type { BaseError } from "#typings/errors"
import type { DefaultChildrenType } from "#typings/globals"
import useCustomContext from "#utils/hooks/useCustomContext"
import { isGuestToken } from "#utils/isGuestToken"
import { jwt } from "#utils/jwt"

const customerInitialState: CustomerState = {
  errors: [],
  addresses: null,
  payments: null,
}

interface Props {
  children: DefaultChildrenType
  isGuest?: boolean
  addressesPageSize?: QueryPageSize
}

interface UseCustomerProviderValueParams {
  accessToken?: string
  interceptors?: InterceptorManager
  order?: Order
  addResourceToInclude: typeof defaultOrderContext.addResourceToInclude
  include?: string[]
  includeLoaded?: Record<string, boolean>
  withoutIncludes?: boolean
  isGuest?: boolean
  pageSize?: QueryPageSize
}

function sortAddresses(addresses?: CustomerState["addresses"]): CustomerState["addresses"] {
  return [...(addresses ?? [])].sort((firstAddress, secondAddress) =>
    (firstAddress.full_name ?? "").localeCompare(secondAddress.full_name ?? "")
  )
}

export function useCustomerProviderValue({
  accessToken,
  interceptors,
  order,
  addResourceToInclude,
  include,
  includeLoaded,
  withoutIncludes,
  isGuest,
  pageSize,
}: UseCustomerProviderValueParams) {
  const [state, setState] = useState<CustomerState>(customerInitialState)
  const customerId = useMemo(() => {
    if (accessToken == null) {
      return undefined
    }

    return jwt(accessToken).owner?.id
  }, [accessToken])
  const guestToken = accessToken ? (isGuest == null ? isGuestToken(accessToken) : isGuest) : isGuest

  useEffect(() => {
    if (!accessToken || guestToken) {
      return
    }

    if (!include?.includes("available_customer_payment_sources.payment_source")) {
      addResourceToInclude({
        newResource: [
          "available_customer_payment_sources.payment_source",
          "available_customer_payment_sources.payment_method",
        ],
      })
    } else if (!includeLoaded?.["available_customer_payment_sources.payment_source"]) {
      addResourceToInclude({
        newResourceLoaded: {
          "available_customer_payment_sources.payment_source": true,
          "available_customer_payment_sources.payment_method": true,
        },
      })
    }
  }, [accessToken, guestToken, include, includeLoaded, addResourceToInclude])

  useEffect(() => {
    if (!accessToken || guestToken || customerId == null) {
      return
    }

    void (async () => {
      if (state.customers == null) {
        const customerInfo = await coreGetCustomerInfo({ accessToken, interceptors, customerId })
        setState((previousState) => ({
          ...previousState,
          customers: customerInfo.customer,
          customerEmail: customerInfo.customerEmail,
        }))
      }

      if (state.addresses == null) {
        const addresses = await coreGetCustomerAddresses({
          accessToken,
          interceptors,
          isOrderAvailable: withoutIncludes != null,
          pageSize,
        })

        setState((previousState) => ({
          ...previousState,
          addresses,
        }))
      }

      const paymentSources = coreGetCustomerPaymentSources({ order })
      if (paymentSources != null && paymentSources.length > 0) {
        setState((previousState) => ({
          ...previousState,
          payments: paymentSources,
        }))
      }

      if (
        order == null &&
        include == null &&
        includeLoaded == null &&
        withoutIncludes === undefined
      ) {
        const payments = await coreGetCustomerPayments({ accessToken, interceptors })
        setState((previousState) => ({
          ...previousState,
          payments,
        }))
      }
    })()
  }, [
    accessToken,
    customerId,
    guestToken,
    include,
    includeLoaded,
    interceptors,
    order,
    pageSize,
    state.addresses,
    state.customers,
    withoutIncludes,
  ])

  return useMemo(() => {
    return {
      isGuest,
      ...state,
      saveCustomerUser: async (customerEmail: string) => {
        if (accessToken == null || order?.id == null) {
          return
        }

        await coreSaveCustomerUser({
          accessToken: accessToken ?? "",
          interceptors,
          customerEmail,
          orderId: order.id,
        })

        setState((previousState) => ({
          ...previousState,
          customerEmail,
        }))
      },
      setCustomerErrors: (errors: BaseError[]) => {
        setState((previousState) => ({
          ...previousState,
          errors,
        }))
      },
      setCustomerEmail: (customerEmail: string) => {
        setState((previousState) => ({
          ...previousState,
          customerEmail,
        }))
      },
      getCustomerPaymentSources: () => {
        const payments = coreGetCustomerPaymentSources({ order })
        if (payments != null && payments.length > 0) {
          setState((previousState) => ({
            ...previousState,
            payments,
          }))
        }
      },
      deleteCustomerPayment: async ({ customerPaymentSourceId }: DeleteCustomerPaymentParams) => {
        if (accessToken == null) {
          return
        }

        await coreDeleteCustomerPayment({
          accessToken: accessToken ?? "",
          interceptors,
          customerPaymentSourceId,
        })

        const payments = await coreGetCustomerPayments({
          accessToken: accessToken ?? "",
          interceptors,
        })

        setState((previousState) => ({
          ...previousState,
          payments,
        }))
      },
      deleteCustomerAddress: async ({ customerAddressId }: DeleteCustomerAddressParams) => {
        if (accessToken == null) {
          return
        }

        await coreDeleteCustomerAddress({
          accessToken: accessToken ?? "",
          interceptors,
          customerAddressId,
        })

        setState((previousState) => ({
          ...previousState,
          addresses:
            previousState.addresses?.filter(({ reference }) => reference !== customerAddressId) ??
            null,
        }))
      },
      setResourceTrigger: async ({
        customerId: triggerCustomerId,
        ...params
      }: SetResourceTriggerParams): Promise<boolean> => {
        if (accessToken == null) {
          return false
        }

        const ownerId = triggerCustomerId ?? customerId
        const triggered = await coreSetResourceTrigger({
          accessToken: accessToken ?? "",
          interceptors,
          customerId: ownerId,
          ...params,
        })

        if (!triggered || !params.reloadList || ownerId == null) {
          return triggered
        }

        if (params.resource === "orders") {
          const orders = await coreGetCustomerOrders({
            accessToken: accessToken ?? "",
            interceptors,
            customerId: ownerId,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
          })
          setState((previousState) => ({
            ...previousState,
            orders,
          }))
        } else {
          const subscriptions = await coreGetCustomerSubscriptions({
            accessToken: accessToken ?? "",
            interceptors,
            customerId: ownerId,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
          })
          setState((previousState) => ({
            ...previousState,
            subscriptions,
          }))
        }

        return triggered
      },
      createCustomerAddress: async (address: TCustomerAddress) => {
        if (accessToken == null) {
          return
        }

        const savedAddress = await coreCreateCustomerAddress({
          accessToken: accessToken ?? "",
          interceptors,
          address,
          customerId,
          addresses: state.addresses ?? undefined,
        })

        setState((previousState) => {
          if (address.id != null) {
            return {
              ...previousState,
              addresses: previousState.addresses?.map((currentAddress) =>
                currentAddress.id === savedAddress.id ? savedAddress : currentAddress
              ) ?? [savedAddress],
            }
          }

          return {
            ...previousState,
            addresses: sortAddresses([...(previousState.addresses ?? []), savedAddress]),
          }
        })
      },
      getCustomerOrders: async ({ pageNumber, pageSize, sortBy }: GetCustomerOrdersParams) => {
        if (accessToken == null || customerId == null) {
          return
        }

        const orders = await coreGetCustomerOrders({
          accessToken: accessToken ?? "",
          interceptors,
          customerId,
          pageNumber,
          pageSize,
          sortBy,
        })

        setState((previousState) => ({
          ...previousState,
          orders,
        }))
      },
      getCustomerSubscriptions: async ({
        pageNumber,
        pageSize,
        sortBy,
        id,
      }: GetCustomerSubscriptionsParams) => {
        if (accessToken == null || customerId == null) {
          return
        }

        const subscriptions = await coreGetCustomerSubscriptions({
          accessToken: accessToken ?? "",
          interceptors,
          customerId,
          pageNumber,
          pageSize,
          sortBy,
          id,
        })

        setState((previousState) => ({
          ...previousState,
          subscriptions,
        }))
      },
      getCustomerAddresses: async () => {
        if (accessToken == null) {
          return
        }

        const addresses = await coreGetCustomerAddresses({
          accessToken: accessToken ?? "",
          interceptors,
          isOrderAvailable: withoutIncludes != null,
          pageSize,
        })

        setState((previousState) => ({
          ...previousState,
          addresses,
        }))
      },
      reloadCustomerAddresses: async () => {
        if (accessToken == null) {
          return
        }

        const addresses = await coreGetCustomerAddresses({
          accessToken: accessToken ?? "",
          interceptors,
          isOrderAvailable: withoutIncludes != null,
          pageSize,
        })

        setState((previousState) => ({
          ...previousState,
          addresses,
        }))
      },
    }
  }, [accessToken, customerId, interceptors, isGuest, order, pageSize, state, withoutIncludes])
}

/**
 * Standalone customer provider component.
 */
export function Customer(props: Props): JSX.Element {
  const { children, isGuest, addressesPageSize } = props
  const { accessToken, interceptors } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: "CommerceLayer",
    currentComponentName: "Customer",
    key: "accessToken",
  })
  const { order, addResourceToInclude, include, includeLoaded, withoutIncludes } =
    useContext(OrderContext)
  const customerValue = useCustomerProviderValue({
    accessToken,
    interceptors,
    order,
    addResourceToInclude,
    include,
    includeLoaded,
    withoutIncludes,
    isGuest,
    pageSize: addressesPageSize,
  })

  return <CustomerContext.Provider value={customerValue}>{children}</CustomerContext.Provider>
}

export default Customer
