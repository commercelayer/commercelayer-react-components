import { createSharedStateStore } from "@commercelayer/core-components"

/** A validation error raised while filling an address form. */
export interface AddressFormError {
  code: string
  message: string
  resource?: string | null
  field?: string
}

/** Which of the two addresses a validator or an error belongs to. */
export type AddressFormResource = "billing_address" | "shipping_address"

/**
 * Validates one mounted address form. Returns the field errors it found, keyed
 * by field name; an empty object means the form is valid.
 */
export type AddressFormValidator = () => Record<string, unknown>

export interface AddressFormState {
  /** Current billing address field values (no prefix). */
  billingAddress: Record<string, unknown>
  /** Current shipping address field values (no prefix). */
  shippingAddress: Record<string, unknown>
  /** True while `saveAddresses` is in flight. */
  isSaving: boolean
  /** Validation errors currently raised by the mounted forms. */
  errors: AddressFormError[]
  /** Validators registered by the mounted forms. */
  validators: Readonly<Partial<Record<AddressFormResource, AddressFormValidator>>>
}

export const EMPTY_ADDRESS: Readonly<Record<string, unknown>> = Object.freeze({})
export const EMPTY_ERRORS: readonly AddressFormError[] = Object.freeze([])

const initialState: AddressFormState = {
  billingAddress: EMPTY_ADDRESS as Record<string, unknown>,
  shippingAddress: EMPTY_ADDRESS as Record<string, unknown>,
  isSaving: false,
  errors: EMPTY_ERRORS as AddressFormError[],
  validators: Object.freeze({}),
}

/**
 * Module-level state shared by every `useAddressForm` instance working on the
 * same order.
 *
 * The address forms and the button that saves them are siblings, not
 * ancestor and descendant — in a stepped checkout the button has to live
 * outside both forms because it saves both. React context cannot reach across
 * that gap, so the state lives here instead and every instance reads the same
 * snapshot wherever it sits in the tree.
 */
const _store = createSharedStateStore<AddressFormState>(initialState)

export const { buildKey, subscribe, getSnapshot, getServerSnapshot, setState, reset, clear } =
  _store
