// The inverted save (invertAddresses) must mirror the normal save in
// AddressReducer: an order address cloned from the book (reference set) is never
// edited in place, and an in-place edit asks the order to recompute taxes.
import type { AddressCreate, CommerceLayerClient, Order } from "@commercelayer/sdk"
import { invertedAddressesHandler } from "#utils/addressesManager"

function fakeSdk() {
  return {
    addresses: {
      create: vi.fn(async () => ({ id: "new-addr" })),
      update: vi.fn(async ({ id }: { id: string }) => ({ id })),
      relationship: vi.fn((id: string) => ({ id, type: "addresses" })),
    },
  } as unknown as CommerceLayerClient & {
    addresses: Record<"create" | "update" | "relationship", ReturnType<typeof vi.fn>>
  }
}

const typed = () => ({ first_name: "Jane", line_1: "Typed st 1", city: "Milan" }) as AddressCreate

describe("invertedAddressesHandler", () => {
  it("creates a new shipping address when the order one is a book clone", async () => {
    const sdk = fakeSdk()
    const order = { id: "o1", shipping_address: { id: "clone-c", reference: "book-a" } } as Order
    const attrs = await invertedAddressesHandler({ order, shippingAddress: typed(), sdk })
    expect(sdk.addresses.update).not.toHaveBeenCalled()
    expect(sdk.addresses.create).toHaveBeenCalledTimes(1)
    expect(attrs?.shipping_address).toEqual({ id: "new-addr", type: "addresses" })
    expect(attrs?._refresh).toBeUndefined()
  })

  it("creates a new billing address when the order one is a book clone", async () => {
    const sdk = fakeSdk()
    const order = { id: "o1", billing_address: { id: "clone-c", reference: "book-a" } } as Order
    const attrs = await invertedAddressesHandler({
      order,
      shipToDifferentAddress: true,
      billingAddress: typed(),
      sdk,
    })
    expect(sdk.addresses.update).not.toHaveBeenCalled()
    expect(sdk.addresses.create).toHaveBeenCalledTimes(1)
    expect(attrs?.billing_address).toEqual({ id: "new-addr", type: "addresses" })
  })

  it("updates the shipping address in place and refreshes the order", async () => {
    const sdk = fakeSdk()
    const order = { id: "o1", shipping_address: { id: "own-1", reference: null } } as Order
    const attrs = await invertedAddressesHandler({ order, shippingAddress: typed(), sdk })
    expect(sdk.addresses.update).toHaveBeenCalledWith(expect.objectContaining({ id: "own-1" }))
    expect(sdk.addresses.create).not.toHaveBeenCalled()
    expect(attrs?._refresh).toBe(true)
  })

  it("updates the billing address in place and refreshes the order", async () => {
    const sdk = fakeSdk()
    const order = { id: "o1", billing_address: { id: "own-2", reference: null } } as Order
    const attrs = await invertedAddressesHandler({
      order,
      shipToDifferentAddress: true,
      billingAddress: typed(),
      sdk,
    })
    expect(sdk.addresses.update).toHaveBeenCalledWith(expect.objectContaining({ id: "own-2" }))
    expect(attrs?._refresh).toBe(true)
  })
})
