import {
  updateOrder as coreUpdateOrder,
  type InterceptorManager,
  retrieveOrder,
  type SaveOrderAddressesParams,
  saveOrderAddresses,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import { useCallback, useId, useMemo, useSyncExternalStore } from "react"
import useSWR from "swr"
import {
  type AddressFormError,
  type AddressFormResource,
  type AddressFormValidator,
  buildKey,
  getServerSnapshot,
  getSnapshot,
  setState,
  subscribe,
} from "./addressFormStore.js"

interface UseAddressFormParams {
  accessToken: string
  orderId?: string | null
  interceptors?: InterceptorManager
  /**
   * Isolates this instance's form state from the other instances working on the
   * same order. Leave it out unless you deliberately render two independent
   * address editors for one order: instances that share an order are meant to
   * share their form values, which is what lets a save button sitting outside
   * the forms save what was typed into them.
   */
  scope?: string
}

interface UseAddressFormReturn {
  /** Current billing address field values (no prefix). */
  billingAddress: Record<string, unknown>
  /** Current shipping address field values (no prefix). */
  shippingAddress: Record<string, unknown>
  /** The fetched order. */
  order: Order | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
  /** Validation errors currently raised by the mounted forms. */
  errors: AddressFormError[]
  /** Update billing address field values. */
  setBillingAddress: (values: Record<string, unknown>) => void
  /** Update shipping address field values. */
  setShippingAddress: (values: Record<string, unknown>) => void
  /** Replace the validation errors raised by the mounted forms. */
  setErrors: (errors: AddressFormError[]) => void
  /**
   * Register a form's validator so that a component outside the form — a save
   * button, typically — can validate it before saving. Returns the function
   * that unregisters it.
   *
   * The validator must keep a stable identity across renders, or every render
   * will register a new one.
   */
  registerValidator: (
    resource: AddressFormResource,
    validator: AddressFormValidator
  ) => () => void
  /**
   * Run every registered validator. Returns whether all of them passed, along
   * with the field errors they found, keyed by resource.
   */
  validateAddresses: () => {
    valid: boolean
    fieldErrors: Partial<Record<AddressFormResource, Record<string, unknown>>>
  }
  /**
   * Save the current billing and/or shipping address to the order.
   *
   * @param params - Optional overrides for clone IDs, email, and ship-to-different flag.
   */
  saveAddresses: (params?: {
    customerEmail?: string
    shipToDifferentAddress?: boolean
    billingAddressCloneId?: string
    shippingAddressCloneId?: string
  }) => Promise<{ success: boolean; order?: Order; error?: unknown }>
}

/**
 * React hook for managing address form state and persisting addresses to a Commerce Layer order.
 *
 * Composes order fetching (via SWR) with billing/shipping address state and a
 * `saveAddresses` mutation that calls the `saveOrderAddresses` core function and then
 * updates the order.
 *
 * The form state is shared, per order, by every instance of this hook: the form
 * components and the button that saves them are siblings rather than ancestor and
 * descendant, so the values cannot travel between them through React context.
 * Pass `scope` to opt out and get an isolated state.
 *
 * @example
 * ```tsx
 * const { billingAddress, setBillingAddress, saveAddresses, isSaving } = useAddressForm({
 *   accessToken,
 *   orderId: 'xYzAbCdE',
 * })
 * ```
 */
export function useAddressForm({
  accessToken,
  orderId,
  interceptors,
  scope,
}: UseAddressFormParams): UseAddressFormReturn {
  const {
    data: order,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR(
    accessToken && orderId != null ? ["order", "retrieve", accessToken, orderId] : null,
    async () => await retrieveOrder({ accessToken, interceptors, id: orderId as string }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Without an order there is nothing to share and nothing to save, but the
  // form must still hold what is being typed rather than drop it silently —
  // that failure mode is the whole reason this state moved out of context.
  // A per-instance key keeps the hook behaving like plain local state until a
  // real order id arrives.
  const instanceId = useId()
  const key = useMemo(
    () => buildKey({ accessToken, orderId, scope }) ?? `local:${instanceId}`,
    [accessToken, orderId, scope, instanceId]
  )

  const stableSubscribe = useCallback(
    (listener: () => void) => subscribe(key, listener),
    [key]
  )
  const stableSnapshot = useCallback(() => getSnapshot(key), [key])
  const state = useSyncExternalStore(stableSubscribe, stableSnapshot, getServerSnapshot)

  const setBillingAddress = useCallback(
    (values: Record<string, unknown>) => {
      setState(key, { billingAddress: values })
    },
    [key]
  )

  const setShippingAddress = useCallback(
    (values: Record<string, unknown>) => {
      setState(key, { shippingAddress: values })
    },
    [key]
  )

  const setErrors = useCallback(
    (errors: AddressFormError[]) => {
      setState(key, { errors })
    },
    [key]
  )

  const registerValidator = useCallback(
    (resource: AddressFormResource, validator: AddressFormValidator) => {
      setState(key, (previous) =>
        previous.validators[resource] === validator
          ? previous
          : { validators: { ...previous.validators, [resource]: validator } }
      )

      return () => {
        setState(key, (previous) => {
          if (previous.validators[resource] !== validator) return previous
          const { [resource]: _removed, ...rest } = previous.validators
          return { validators: rest }
        })
      }
    },
    [key]
  )

  const validateAddresses = useCallback((): {
    valid: boolean
    fieldErrors: Partial<Record<AddressFormResource, Record<string, unknown>>>
  } => {
    const { validators } = getSnapshot(key)
    const fieldErrors: Partial<Record<AddressFormResource, Record<string, unknown>>> = {}
    let valid = true

    for (const [resource, validator] of Object.entries(validators)) {
      const found = validator?.() ?? {}
      if (Object.keys(found).length > 0) {
        valid = false
        fieldErrors[resource as AddressFormResource] = found
      }
    }

    return { valid, fieldErrors }
  }, [key])

  const saveAddresses = useCallback(
    async (
      params: {
        customerEmail?: string
        shipToDifferentAddress?: boolean
        billingAddressCloneId?: string
        shippingAddressCloneId?: string
      } = {}
    ): Promise<{ success: boolean; order?: Order; error?: unknown }> => {
      if (order == null) return { success: false }

      // Read through the store rather than closing over the rendered snapshot:
      // the values may have been typed into a form that rendered after this
      // callback was created.
      const { billingAddress, shippingAddress } = getSnapshot(key)

      setState(key, { isSaving: true })
      try {
        const saveParams: SaveOrderAddressesParams = {
          accessToken,
          interceptors,
          order,
          billingAddress,
          shippingAddress,
          ...params,
        }

        const { success, orderAttributes, error: saveError } = await saveOrderAddresses(saveParams)

        if (!success || orderAttributes == null) {
          return { success: false, error: saveError }
        }

        const { id, ...attributes } = orderAttributes
        const updatedOrder = await coreUpdateOrder({
          accessToken,
          interceptors,
          id: order.id,
          attributes,
        })

        await mutate(updatedOrder)
        return { success: true, order: updatedOrder }
      } catch (error) {
        console.error(error)
        return { success: false, error }
      } finally {
        setState(key, { isSaving: false })
      }
    },
    [accessToken, interceptors, order, key, mutate]
  )

  return {
    billingAddress: state.billingAddress,
    shippingAddress: state.shippingAddress,
    order,
    isLoading,
    isSaving: state.isSaving,
    error: swrError != null ? String(swrError) : null,
    errors: state.errors,
    setBillingAddress,
    setShippingAddress,
    setErrors,
    registerValidator,
    validateAddresses,
    saveAddresses,
  }
}
