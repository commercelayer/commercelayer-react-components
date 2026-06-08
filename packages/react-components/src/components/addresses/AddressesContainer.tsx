import { type JSX, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import addressReducer, {
  type AddressResource,
  addressInitialState,
  type ICustomerAddress,
  type SetAddressParams,
  saveAddresses,
  setAddressErrors,
  setCloneAddress,
} from "#reducers/AddressReducer"
import type { TCustomerAddress } from "#typings/customers"
import type { BaseError } from "#typings/errors"
import { setCustomerOrderParam } from "#utils/localStorage"

interface Props {
  children: ReactNode
  /**
   * If true, the shipping address will be considered. Default is false.
   */
  shipToDifferentAddress?: boolean
  /**
   * If true, the address will be considered a business address.
   */
  isBusiness?: boolean
  /**
   * If true, the shipping address will be considered as primary address. Default is false.
   */
  invertAddresses?: boolean
}

/**
 * @deprecated
 * `AddressesContainer` is deprecated. Use standalone `<BillingAddressForm>` and
 * `<ShippingAddressForm>` instead — they no longer require a container wrapper.
 *
 * @example Migration:
 * ```tsx
 * // Before (deprecated)
 * <AddressesContainer isBusiness={isBusiness} shipToDifferentAddress={ship}>
 *   <BillingAddressForm>…</BillingAddressForm>
 *   <ShippingAddressForm>…</ShippingAddressForm>
 * </AddressesContainer>
 *
 * // After
 * <BillingAddressForm isBusiness={isBusiness} shipToDifferentAddress={ship}>…</BillingAddressForm>
 * <ShippingAddressForm shipToDifferentAddress={ship}>…</ShippingAddressForm>
 * ```
 */
export function AddressesContainer(props: Props): JSX.Element {
  const { children, shipToDifferentAddress = false, isBusiness, invertAddresses = false } = props
  const [state, dispatch] = useReducer(addressReducer, addressInitialState)
  const { order, orderId, updateOrder } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (order?.status === "draft") {
      // Set the customer order parameters to false when the order is in draft status
      setCustomerOrderParam("_save_billing_address_to_customer_address_book", "false")
      setCustomerOrderParam("_save_shipping_address_to_customer_address_book", "false")
    }
  }, [order?.status])
  useEffect(() => {
    dispatch({
      type: "setShipToDifferentAddress",
      payload: {
        shipToDifferentAddress,
        isBusiness,
        invertAddresses,
      },
    })
    return () => {
      dispatch({
        type: "cleanup",
        payload: {
          shipToDifferentAddress: false,
        },
      })
    }
  }, [shipToDifferentAddress, isBusiness, invertAddresses])
  const errorsRef = useRef(state.errors)
  errorsRef.current = state.errors

  const setAddressFn = useCallback((params: SetAddressParams<TCustomerAddress>) => {
    defaultAddressContext.setAddress({ ...params, dispatch })
  }, [])

  const setAddressErrorsFn = useCallback((errors: BaseError[], resource: AddressResource) => {
    setAddressErrors({
      errors,
      resource,
      dispatch,
      currentErrors: errorsRef.current,
    })
  }, [])

  const saveAddressesFn = useCallback(async (params: {
    customerEmail?: string
    customerAddress?: ICustomerAddress
  }): ReturnType<typeof saveAddresses> =>
    await saveAddresses({
      config,
      dispatch,
      updateOrder,
      order,
      orderId,
      state,
      ...params,
    }),
  [config, updateOrder, order, orderId, state])

  const setCloneAddressFn = useCallback((id: string, resource: AddressResource): void => {
    setCloneAddress(id, resource, dispatch)
  }, [])

  const contextValue = useMemo(() => ({
    ...state,
    setAddressErrors: setAddressErrorsFn,
    setAddress: setAddressFn,
    saveAddresses: saveAddressesFn,
    setCloneAddress: setCloneAddressFn,
  }), [state, setAddressErrorsFn, setAddressFn, saveAddressesFn, setCloneAddressFn])
  return <AddressesContext.Provider value={contextValue}>{children}</AddressesContext.Provider>
}

export default AddressesContainer
