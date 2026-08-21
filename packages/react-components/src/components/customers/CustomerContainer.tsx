import type { QueryPageSize } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import type { DefaultChildrenType } from "#typings/globals"
import { useCustomerProviderValue } from "./Customer"

interface Props {
  children: DefaultChildrenType
  isGuest?: boolean
  addressesPageSize?: QueryPageSize
}

/**
 * @deprecated Use `<Customer>` instead.
 */
export function CustomerContainer(props: Props): JSX.Element {
  const { children, isGuest, addressesPageSize } = props
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const { order, addResourceToInclude, include, includeLoaded, withoutIncludes } =
    useContext(OrderContext)

  useEffect(() => {
    const runtime = globalThis as typeof globalThis & {
      process?: {
        env?: {
          NODE_ENV?: string
        }
      }
    }

    if (runtime.process?.env?.NODE_ENV !== "production") {
      console.warn("CustomerContainer is deprecated. Use <Customer> component instead.")
    }
  }, [])

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

export default CustomerContainer
