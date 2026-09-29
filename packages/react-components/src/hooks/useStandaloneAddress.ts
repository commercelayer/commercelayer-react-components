import { useAddressForm } from "@commercelayer/react-hooks-components"
import type { Order } from "@commercelayer/sdk"
import { useCallback, useEffect, useMemo, useRef } from "react"
import type { ErrorMode } from "#context/BillingAddressFormContext"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import type {
  AddressResource,
  ICustomerAddress,
  setAddress as setAddressAction,
} from "#reducers/AddressReducer"
import type { updateOrder } from "#reducers/OrderReducer"
import type { TCustomerAddress } from "#typings/customers"
import type { BaseError } from "#typings/errors"
import { formCleaner } from "#utils/formCleaner"

interface UseStandaloneAddressParams {
  isStandalone: boolean
  config: CommerceLayerConfig
  order: Order | undefined
  orderId: string | undefined
  updateOrder: typeof updateOrder | undefined
  /**
   * The flags are published to the shared state so that components in another
   * subtree can read them. Leave one out and this instance does not touch it —
   * which is what a component that only reads, such as the save button, wants.
   */
  isBusiness?: boolean
  shipToDifferentAddress?: boolean
  invertAddresses?: boolean
  /** The address this instance edits, when it edits one. */
  resource?: AddressResource
  /**
   * Lets a component outside the form run its validation. Only registered when
   * `errorMode` is `"submit"`, since that is the mode where validation is meant
   * to happen on save rather than as the customer types.
   */
  validate?: () => Record<string, unknown>
  errorMode?: ErrorMode
}

/**
 * Address state for the standalone forms.
 *
 * The state does not live here: it lives in the shared store behind
 * `useAddressForm`, keyed by order. That is what lets `<SaveAddressesButton>`
 * save what was typed into `<BillingAddressForm>` and `<ShippingAddressForm>`
 * even though it is their sibling and no React context can reach across.
 *
 * What this hook does is dress that state in the shape `AddressesContext`
 * expects, so the components that read the context keep working unchanged.
 */
export function useStandaloneAddress({
  isStandalone,
  config,
  order,
  orderId,
  updateOrder,
  isBusiness,
  shipToDifferentAddress,
  invertAddresses,
  resource,
  validate,
  errorMode,
}: UseStandaloneAddressParams) {
  const {
    billingAddress,
    shippingAddress,
    errors,
    billingAddressCloneId,
    shippingAddressCloneId,
    setBillingAddress,
    setShippingAddress,
    setResourceErrors,
    setFlags,
    setCloneIds,
    saveAddresses,
    registerValidator,
    validateAddresses,
    shipToDifferentAddress: sharedShipToDifferentAddress,
    isBusiness: sharedIsBusiness,
    invertAddresses: sharedInvertAddresses,
  } = useAddressForm({
    accessToken: config.accessToken ?? "",
    orderId,
    interceptors: config.interceptors,
    // The order is already on screen and `OrderContext` owns it, so the hook
    // neither fetches it again nor writes it behind the context's back.
    order,
    updateOrder,
  })

  // The flags arrive as props on whichever component is mounted; publishing
  // them is what makes them readable from the other subtree. With a container
  // in the tree it stays the authority, so nothing is published.
  useEffect(() => {
    if (!isStandalone) return
    const flags: Parameters<typeof setFlags>[0] = {}
    if (shipToDifferentAddress !== undefined) flags.shipToDifferentAddress = shipToDifferentAddress
    if (isBusiness !== undefined) flags.isBusiness = isBusiness
    if (invertAddresses !== undefined) flags.invertAddresses = invertAddresses
    if (Object.keys(flags).length > 0) setFlags(flags)
  }, [isStandalone, shipToDifferentAddress, isBusiness, invertAddresses, setFlags])

  // `validate` is rebuilt on every render, so what gets registered is a stable
  // wrapper that calls whichever one is current.
  const validateRef = useRef(validate)
  validateRef.current = validate
  const registeredValidate = useCallback(() => validateRef.current?.() ?? {}, [])

  useEffect(() => {
    if (!isStandalone || resource == null || errorMode !== "submit") return
    return registerValidator(resource, registeredValidate)
  }, [isStandalone, resource, errorMode, registerValidator, registeredValidate])

  const standaloneSetAddress = useCallback(
    ({ values, resource }: Parameters<typeof setAddressAction>[0]) => {
      // `formCleaner` strips the resource prefix and drops the save-to-book
      // flag, and it edits in place — hence the copy.
      const cleaned = (formCleaner({ ...values }) ?? {}) as Record<string, unknown>
      if (resource === "billing_address") {
        setBillingAddress(cleaned)
      } else {
        setShippingAddress(cleaned)
      }
    },
    [setBillingAddress, setShippingAddress]
  )

  const standaloneSetAddressErrors = useCallback(
    (nextErrors: BaseError[], resource: AddressResource) => {
      setResourceErrors(resource, nextErrors)
    },
    [setResourceErrors]
  )

  const standaloneSetCloneAddress = useCallback(
    (id: string, resource: AddressResource) => {
      setCloneIds(
        resource === "billing_address"
          ? { billingAddressCloneId: id }
          : { shippingAddressCloneId: id }
      )
    },
    [setCloneIds]
  )

  const standaloneSaveAddresses = useCallback(
    async (params: { customerEmail?: string; customerAddress?: ICustomerAddress } = {}) => {
      const { customerEmail, customerAddress } = params
      const chosenAddress =
        customerAddress?.id == null
          ? {}
          : customerAddress.resource === "billing_address"
            ? { billingAddressCloneId: customerAddress.id }
            : { shippingAddressCloneId: customerAddress.id }

      return await saveAddresses({ customerEmail, ...chosenAddress })
    },
    [saveAddresses]
  )

  const standaloneState = useMemo(
    () => ({
      billing_address: billingAddress as TCustomerAddress,
      shipping_address: shippingAddress as TCustomerAddress,
      errors: errors as BaseError[],
      billingAddressId: billingAddressCloneId,
      shippingAddressId: shippingAddressCloneId,
      // Read back from the shared state rather than from this instance's props:
      // the flag may have been published by the form in the other subtree.
      isBusiness: sharedIsBusiness,
      shipToDifferentAddress: sharedShipToDifferentAddress,
      invertAddresses: sharedInvertAddresses,
    }),
    [
      billingAddress,
      shippingAddress,
      errors,
      billingAddressCloneId,
      shippingAddressCloneId,
      sharedIsBusiness,
      sharedShipToDifferentAddress,
      sharedInvertAddresses,
    ]
  )

  const standaloneContextValue = useMemo(
    () => ({
      ...standaloneState,
      setAddress: standaloneSetAddress,
      setAddressErrors: standaloneSetAddressErrors,
      saveAddresses: standaloneSaveAddresses,
      setCloneAddress: standaloneSetCloneAddress,
    }),
    [
      standaloneState,
      standaloneSetAddress,
      standaloneSetAddressErrors,
      standaloneSaveAddresses,
      standaloneSetCloneAddress,
    ]
  )

  return {
    isStandalone,
    standaloneSetAddress,
    standaloneSetAddressErrors,
    standaloneContextValue,
    standaloneState,
    validateAddresses,
  }
}
