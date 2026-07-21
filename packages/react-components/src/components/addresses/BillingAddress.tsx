import { updateAddressReference } from "@commercelayer/core-components"
import { type JSX, useCallback, useContext, useEffect, useMemo, useState } from "react"
import AddressContext from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import type { DefaultChildrenType } from "#typings/globals"

interface Props {
  children: DefaultChildrenType
}

/**
 * Standalone context provider for billing address state.
 *
 * Manages the selected billing address clone ID and the linked customer address reference.
 * Exposes `setBillingAddress` to child components that need to set the billing address.
 *
 * Can be used directly inside `<AddressesContainer>` — no need to wrap in `<BillingAddressContainer>`.
 *
 * <span title='Requirements' type='warning'>
 * Must be a descendant of `<AddressesContainer>`.
 * </span>
 */
export function BillingAddress({ children }: Props): JSX.Element {
  const config = useContext(CommerceLayerContext)
  const { order, include, addResourceToInclude } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
  const [cloneId, setCloneId] = useState<string>("")
  const [billingCustomerAddressId, setBillingCustomerAddressId] = useState<string | undefined>()

  useEffect(() => {
    if (!include?.includes("billing_address")) {
      addResourceToInclude({
        newResource: "billing_address",
        resourcesIncluded: include,
      })
    }
  }, [include, addResourceToInclude])

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-sync customer address id when order changes
  useEffect(() => {
    const ref = order?.billing_address?.reference
    if (ref) {
      setBillingCustomerAddressId(ref)
      setCloneAddress(ref, "billing_address")
    }
    return () => {
      setCloneId("")
      setBillingCustomerAddressId(undefined)
    }
  }, [order])

  const setBillingAddress = useCallback(
    async (id: string, options?: { customerAddressId: string }): Promise<void> => {
      try {
        if (order) {
          if (options?.customerAddressId && config.accessToken) {
            await updateAddressReference({
              id,
              reference: options.customerAddressId,
              accessToken: config.accessToken,
              interceptors: config.interceptors,
            })
          }
          setCloneId(id)
        }
        setCloneAddress(id, "billing_address")
      } catch (error) {
        console.error("Set billing address", error)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, config, setCloneAddress]
  )

  const contextValue = useMemo(
    () => ({
      _billing_address_clone_id: cloneId,
      billingCustomerAddressId,
      setBillingAddress,
    }),
    [cloneId, billingCustomerAddressId, setBillingAddress]
  )

  return (
    <BillingAddressContext.Provider value={contextValue}>{children}</BillingAddressContext.Provider>
  )
}

export default BillingAddress
