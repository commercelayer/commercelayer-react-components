import { updateAddressReference } from "@commercelayer/core"
import { type JSX, useCallback, useContext, useEffect, useMemo, useState } from "react"
import AddressContext from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"
import type { DefaultChildrenType } from "#typings/globals"

interface Props {
  children: DefaultChildrenType
}

/**
 * Standalone context provider for shipping address state.
 *
 * Manages the selected shipping address clone ID and the linked customer address reference.
 * Exposes `setShippingAddress` to child components that need to set the shipping address.
 *
 * Can be used directly inside `<AddressesContainer>` — no need to wrap in `<ShippingAddressContainer>`.
 *
 * <span title='Requirements' type='warning'>
 * Must be a descendant of `<AddressesContainer>`.
 * </span>
 */
export function ShippingAddress({ children }: Props): JSX.Element {
  const config = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
  const [cloneId, setCloneId] = useState<string>("")
  const [shippingCustomerAddressId, setShippingCustomerAddressId] = useState<string | undefined>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-sync customer address id when order changes
  useEffect(() => {
    const ref = order?.shipping_address?.reference
    if (ref) {
      setShippingCustomerAddressId(ref)
      setCloneAddress(ref, "shipping_address")
    }
    return () => {
      setCloneId("")
      setShippingCustomerAddressId(undefined)
    }
  }, [order])

  const setShippingAddress = useCallback(
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
        setCloneAddress(id, "shipping_address")
      } catch (error) {
        console.error("Set shipping address", error)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, config, setCloneAddress]
  )

  const contextValue = useMemo(
    () => ({
      _shipping_address_clone_id: cloneId,
      shippingCustomerAddressId,
      setShippingAddress,
    }),
    [cloneId, shippingCustomerAddressId, setShippingAddress]
  )

  return (
    <ShippingAddressContext.Provider value={contextValue}>
      {children}
    </ShippingAddressContext.Provider>
  )
}

export default ShippingAddress
