import type { Address, AddressCreate, Order, OrderUpdate } from "@commercelayer/sdk"
import type { InterceptorManager } from "#sdk"
import { getSdk } from "#sdk"

export interface SaveOrderAddressesParams {
  accessToken: string
  interceptors?: InterceptorManager
  /**
   * Partial order data needed to resolve existing address IDs.
   */
  order: Pick<Order, "id"> & {
    billing_address?: { id?: string; reference?: string | null } | null
    shipping_address?: { id?: string; reference?: string | null } | null
    /**
     * Only `item.do_not_ship` is read. The item is left untyped because the
     * SDK's line item union does not surface that flag on every member.
     */
    line_items?: Array<{ item?: unknown } | null> | null
  }
  /**
   * Cleaned billing address data — no `billing_address_` prefix on keys.
   */
  billingAddress?: Record<string, unknown>
  /**
   * Cleaned shipping address data — no `shipping_address_` prefix on keys.
   */
  shippingAddress?: Record<string, unknown>
  /** ID of a saved customer address to clone as billing address. */
  billingAddressCloneId?: string
  /** ID of a saved customer address to clone as shipping address. */
  shippingAddressCloneId?: string
  /** Whether the shipping address differs from billing. Default: `false`. */
  shipToDifferentAddress?: boolean
  /** Customer email to set on the order. */
  customerEmail?: string
  /**
   * Swaps the two addresses: the shipping address becomes the one the order is
   * built around and the billing address is the optional second one. Default:
   * `false`.
   */
  invertAddresses?: boolean
}

function sanitizeMetadata(address: AddressCreate): AddressCreate {
  const result = { ...address }
  for (const key of Object.keys(result)) {
    if (key.startsWith("metadata_")) {
      const metaKey = key.replace("metadata_", "")
      result.metadata = {
        ...(result.metadata ?? {}),
        [metaKey]: result[key as keyof AddressCreate],
      }
      delete result[key as keyof AddressCreate]
    }
  }
  return result
}

type Sdk = ReturnType<typeof getSdk>

/**
 * The mirror image of the normal flow, with the roles of the two addresses
 * swapped: the order is built around the shipping address and the billing one
 * is the optional second address.
 *
 * Two asymmetries against the normal flow are deliberate — they are the
 * behaviour this branch has always had: it updates an existing address without
 * first checking that its `reference` is null, and it does not set `_refresh`.
 */
async function saveInvertedAddresses({
  sdk,
  order,
  billingAddress,
  billingAddressCloneId,
  shippingAddress,
  shippingAddressCloneId,
  shipToDifferentAddress,
  customerEmail,
}: {
  sdk: Sdk
  order: SaveOrderAddressesParams["order"]
  billingAddress?: Record<string, unknown>
  billingAddressCloneId?: string
  shippingAddress?: Record<string, unknown>
  shippingAddressCloneId?: string
  shipToDifferentAddress: boolean
  customerEmail?: string
}): Promise<OrderUpdate> {
  const orderAttributes: OrderUpdate = {
    id: order.id,
    customer_email: customerEmail,
    _billing_address_clone_id: shippingAddressCloneId,
    _shipping_address_clone_id: shippingAddressCloneId,
  }

  const currentShippingRef = order.shipping_address?.reference
  if (currentShippingRef != null && currentShippingRef === shippingAddressCloneId) {
    orderAttributes._billing_address_clone_id = order.billing_address?.id
    orderAttributes._shipping_address_clone_id = order.shipping_address?.id
  }

  const hasShippingAddress = shippingAddress != null && Object.keys(shippingAddress).length > 0

  if (hasShippingAddress && !shippingAddressCloneId) {
    delete orderAttributes._billing_address_clone_id
    delete orderAttributes._shipping_address_clone_id
    orderAttributes._billing_address_same_as_shipping = true

    const shippingData = sanitizeMetadata(shippingAddress as unknown as AddressCreate)
    let address: Address

    if (order.shipping_address?.id != null) {
      address = await sdk.addresses.update({ id: order.shipping_address.id, ...shippingData })
    } else {
      address = await sdk.addresses.create(shippingData)
      orderAttributes.shipping_address = sdk.addresses.relationship(address.id)
    }
  }

  if (shipToDifferentAddress) {
    delete orderAttributes._billing_address_same_as_shipping

    if (billingAddressCloneId) {
      orderAttributes._billing_address_clone_id = billingAddressCloneId
    }

    const hasBillingAddress = billingAddress != null && Object.keys(billingAddress).length > 0

    if (hasBillingAddress) {
      delete orderAttributes._billing_address_clone_id

      const billingData = sanitizeMetadata(billingAddress as unknown as AddressCreate)
      let address: Address

      if (order.billing_address?.id != null) {
        address = await sdk.addresses.update({ id: order.billing_address.id, ...billingData })
      } else {
        address = await sdk.addresses.create(billingData)
        orderAttributes.billing_address = sdk.addresses.relationship(address.id)
      }
    }
  }

  return orderAttributes
}

/**
 * Saves billing and/or shipping addresses to a Commerce Layer order.
 *
 * Handles creating or updating address resources via the SDK and builds the
 * `OrderUpdate` attributes payload. The caller is responsible for applying
 * the returned `orderAttributes` to the order.
 *
 * @returns `{ success: true, orderAttributes }` on success, `{ success: false, error }` on failure.
 *
 * @example
 * ```ts
 * const { success, orderAttributes } = await saveOrderAddresses({
 *   accessToken,
 *   order,
 *   billingAddress: { first_name: 'John', last_name: 'Doe', ... },
 * })
 * if (success && orderAttributes) {
 *   await updateOrder({ accessToken, id: order.id, attributes: orderAttributes })
 * }
 * ```
 */
export async function saveOrderAddresses({
  accessToken,
  interceptors,
  order,
  billingAddress,
  shippingAddress,
  billingAddressCloneId,
  shippingAddressCloneId,
  shipToDifferentAddress = false,
  customerEmail,
  invertAddresses = false,
}: SaveOrderAddressesParams): Promise<{
  success: boolean
  orderAttributes?: OrderUpdate
  error?: unknown
}> {
  try {
    const sdk = getSdk({ accessToken, interceptors })

    if (invertAddresses) {
      return {
        success: true,
        orderAttributes: await saveInvertedAddresses({
          sdk,
          order,
          billingAddress,
          billingAddressCloneId,
          shippingAddress,
          shippingAddressCloneId,
          shipToDifferentAddress,
          customerEmail,
        }),
      }
    }

    const orderAttributes: OrderUpdate = {
      id: order.id,
      customer_email: customerEmail,
      _billing_address_clone_id: billingAddressCloneId,
      _shipping_address_clone_id: billingAddressCloneId,
    }

    // If the current billing address reference matches the clone ID, reuse existing address IDs.
    const currentBillingRef = order.billing_address?.reference
    if (currentBillingRef != null && currentBillingRef === billingAddressCloneId) {
      orderAttributes._billing_address_clone_id = order.billing_address?.id
      orderAttributes._shipping_address_clone_id = order.shipping_address?.id
    }

    const hasBillingAddress = billingAddress != null && Object.keys(billingAddress).length > 0

    if (hasBillingAddress && !billingAddressCloneId) {
      delete orderAttributes._billing_address_clone_id
      delete orderAttributes._shipping_address_clone_id

      // An order whose every line item ships nothing has no shipping address to
      // keep in step with the billing one. `line_items` missing from the order
      // reads as "not a digital-only order", which is how it has always read.
      const doNotShipItems = order.line_items?.every(
        (lineItem) => (lineItem?.item as { do_not_ship?: boolean | null } | undefined)?.do_not_ship === true
      )
      if (doNotShipItems !== true) {
        orderAttributes._shipping_address_same_as_billing = true
      }

      const billingData = sanitizeMetadata(billingAddress as unknown as AddressCreate)
      let address: Address

      if (order.billing_address?.id != null && order.billing_address.reference == null) {
        address = await sdk.addresses.update({ id: order.billing_address.id, ...billingData })
        orderAttributes._refresh = true
      } else {
        address = await sdk.addresses.create(billingData)
        orderAttributes.billing_address = sdk.addresses.relationship(address.id)
      }
    }

    if (!shipToDifferentAddress && billingAddressCloneId) {
      orderAttributes._shipping_address_same_as_billing = true
      orderAttributes._shipping_address_clone_id = billingAddressCloneId
    }

    if (shipToDifferentAddress) {
      delete orderAttributes._shipping_address_same_as_billing

      if (shippingAddressCloneId) {
        orderAttributes._shipping_address_clone_id = shippingAddressCloneId
      }

      const hasShippingAddress = shippingAddress != null && Object.keys(shippingAddress).length > 0

      if (hasShippingAddress) {
        delete orderAttributes._shipping_address_clone_id

        const shippingData = sanitizeMetadata(shippingAddress as unknown as AddressCreate)
        let address: Address

        if (order.shipping_address?.id != null && order.shipping_address.reference == null) {
          address = await sdk.addresses.update({
            id: order.shipping_address.id,
            ...shippingData,
          })
          orderAttributes._refresh = true
        } else {
          address = await sdk.addresses.create(shippingData)
          orderAttributes.shipping_address = sdk.addresses.relationship(address.id)
        }
      }
    }

    return { success: true, orderAttributes }
  } catch (error) {
    console.error(error)
    return { success: false, error }
  }
}
