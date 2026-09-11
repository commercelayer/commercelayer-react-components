import {
  updateOrder as coreUpdateOrder,
  type InterceptorManager,
  retrieveOrder,
  type SaveOrderAddressesParams,
  saveOrderAddresses,
} from "@commercelayer/core-components"
import type { Order, OrderUpdate } from "@commercelayer/sdk"
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
   * An order you already have. When given, the hook does not fetch it — useful
   * when the caller already holds the order and a second request would be
   * wasted.
   */
  order?: Order | null
  /**
   * Applies the order update yourself instead of letting the hook call the API.
   * Use it when the order lives in a store of your own that has to learn about
   * the change; return the updated order so the hook can report it back.
   */
  updateOrder?: (params: {
    id: string
    attributes: OrderUpdate
  }) => Promise<{ order?: Order } | undefined>
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
  /** Whether the shipping address differs from the billing one. */
  shipToDifferentAddress: boolean
  /** Whether the forms collect business fields. */
  isBusiness: boolean
  /** Whether the order is built around the shipping address instead. */
  invertAddresses: boolean
  /** Saved customer address to clone as the billing address. */
  billingAddressCloneId?: string
  /** Saved customer address to clone as the shipping address. */
  shippingAddressCloneId?: string
  /** Update billing address field values. */
  setBillingAddress: (values: Record<string, unknown>) => void
  /** Update shipping address field values. */
  setShippingAddress: (values: Record<string, unknown>) => void
  /** Replace the validation errors raised by the mounted forms. */
  setErrors: (errors: AddressFormError[]) => void
  /**
   * Replace the errors raised by one form, leaving the other form's errors
   * alone. Errors are matched on their `resource`.
   */
  setResourceErrors: (resource: AddressFormResource, errors: AddressFormError[]) => void
  /** Update the form-wide flags. Only the given ones change. */
  setFlags: (flags: {
    shipToDifferentAddress?: boolean
    isBusiness?: boolean
    invertAddresses?: boolean
  }) => void
  /** Point one or both addresses at a saved customer address. */
  setCloneIds: (cloneIds: {
    billingAddressCloneId?: string
    shippingAddressCloneId?: string
  }) => void
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
  order: providedOrder,
  updateOrder: providedUpdateOrder,
  scope,
}: UseAddressFormParams): UseAddressFormReturn {
  const {
    data: fetchedOrder,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR(
    providedOrder == null && accessToken && orderId != null
      ? ["order", "retrieve", accessToken, orderId]
      : null,
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
  const order = providedOrder ?? fetchedOrder

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

  const setResourceErrors = useCallback(
    (resource: AddressFormResource, errors: AddressFormError[]) => {
      setState(key, (previous) => {
        const kept = previous.errors.filter((error) => error.resource !== resource)
        const raised = errors.filter((error) => error.resource === resource)
        const merged = [...kept, ...raised]
        // Two empty lists are still two different arrays, and handing back a
        // new one on every keystroke would re-render every subscriber.
        if (merged.length === 0 && previous.errors.length === 0) return previous
        return { errors: merged }
      })
    },
    [key]
  )

  const setFlags = useCallback(
    (flags: {
      shipToDifferentAddress?: boolean
      isBusiness?: boolean
      invertAddresses?: boolean
    }) => {
      setState(key, flags)
    },
    [key]
  )

  const setCloneIds = useCallback(
    (cloneIds: { billingAddressCloneId?: string; shippingAddressCloneId?: string }) => {
      setState(key, cloneIds)
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
      const {
        billingAddress,
        shippingAddress,
        shipToDifferentAddress,
        invertAddresses,
        billingAddressCloneId,
        shippingAddressCloneId,
      } = getSnapshot(key)

      setState(key, { isSaving: true })
      try {
        const saveParams: SaveOrderAddressesParams = {
          accessToken,
          interceptors,
          order,
          billingAddress,
          shippingAddress,
          shipToDifferentAddress,
          invertAddresses,
          billingAddressCloneId,
          shippingAddressCloneId,
          ...params,
        }

        const { success, orderAttributes, error: saveError } = await saveOrderAddresses(saveParams)

        if (!success || orderAttributes == null) {
          return { success: false, error: saveError }
        }

        if (providedUpdateOrder != null) {
          const applied = await providedUpdateOrder({
            id: order.id,
            attributes: orderAttributes,
          })
          return { success: true, order: applied?.order }
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
    [accessToken, interceptors, order, key, mutate, providedUpdateOrder]
  )

  return {
    billingAddress: state.billingAddress,
    shippingAddress: state.shippingAddress,
    order,
    isLoading,
    isSaving: state.isSaving,
    error: swrError != null ? String(swrError) : null,
    errors: state.errors,
    shipToDifferentAddress: state.shipToDifferentAddress,
    isBusiness: state.isBusiness,
    invertAddresses: state.invertAddresses,
    billingAddressCloneId: state.billingAddressCloneId,
    shippingAddressCloneId: state.shippingAddressCloneId,
    setBillingAddress,
    setShippingAddress,
    setErrors,
    setResourceErrors,
    setFlags,
    setCloneIds,
    registerValidator,
    validateAddresses,
    saveAddresses,
  }
}
