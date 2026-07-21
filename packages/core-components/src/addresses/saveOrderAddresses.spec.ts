import { beforeEach, describe, expect, test, vi } from "vitest"
import { saveOrderAddresses } from "./saveOrderAddresses.js"

const {
  mockCreate,
  mockUpdate,
  mockRelationship,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockCreate = vi.fn()
  const mockUpdate = vi.fn()
  const mockRelationship = vi.fn((id: string) => ({ id, type: "customer_addresses" }))
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockCreate,
    mockUpdate,
    mockRelationship,
    mockAddRequestInterceptor,
    mockAddResponseInterceptor,
    mockAddRawResponseReader,
  }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue({
    addRequestInterceptor: mockAddRequestInterceptor,
    addResponseInterceptor: mockAddResponseInterceptor,
    addRawResponseReader: mockAddRawResponseReader,
    addresses: {
      create: mockCreate,
      update: mockUpdate,
      relationship: mockRelationship,
    },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

const baseOrder = { id: "ord_1" }

beforeEach(() => {
  vi.clearAllMocks()
  mockAddRequestInterceptor.mockReturnValue(1)
  mockAddResponseInterceptor.mockReturnValue(1)
  mockCreate.mockResolvedValue({ id: "addr_new" })
  mockUpdate.mockResolvedValue({ id: "addr_existing" })
  mockRelationship.mockImplementation((id: string) => ({ id, type: "addresses" }))
})

describe("saveOrderAddresses", () => {
  describe("billing address – create (no existing address)", () => {
    test("creates a new address and sets billing_address relationship", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: { first_name: "John", last_name: "Doe" },
      })

      expect(result.success).toBe(true)
      expect(mockCreate).toHaveBeenCalledWith({ first_name: "John", last_name: "Doe" })
      expect(mockRelationship).toHaveBeenCalledWith("addr_new")
      expect(result.orderAttributes?.billing_address).toEqual({ id: "addr_new", type: "addresses" })
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBe(true)
      expect(result.orderAttributes?._billing_address_clone_id).toBeUndefined()
      expect(result.orderAttributes?._refresh).toBeUndefined()
    })

    test("creates a new address when existing billing_address has a reference", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: {
          ...baseOrder,
          billing_address: { id: "addr_old", reference: "cust-addr-ref" },
        },
        billingAddress: { first_name: "Jane" },
      })

      expect(mockCreate).toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(result.orderAttributes?.billing_address).toBeDefined()
      expect(result.orderAttributes?._refresh).toBeUndefined()
    })
  })

  describe("billing address – update (existing address without reference)", () => {
    test("updates an existing address and sets _refresh=true", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: {
          ...baseOrder,
          billing_address: { id: "addr_existing", reference: null },
        },
        billingAddress: { first_name: "Updated" },
      })

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({ id: "addr_existing", first_name: "Updated" })
      expect(mockCreate).not.toHaveBeenCalled()
      expect(result.orderAttributes?._refresh).toBe(true)
      expect(result.orderAttributes?.billing_address).toBeUndefined()
    })
  })

  describe("billing address clone ID", () => {
    test("sets clone IDs in orderAttributes and skips address creation", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddressCloneId: "cust_addr_1",
      })

      expect(result.success).toBe(true)
      expect(mockCreate).not.toHaveBeenCalled()
      expect(result.orderAttributes?._billing_address_clone_id).toBe("cust_addr_1")
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBe(true)
      expect(result.orderAttributes?._shipping_address_clone_id).toBe("cust_addr_1")
    })

    test("reuses billing address ID when billing reference matches clone ID", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: {
          ...baseOrder,
          billing_address: { id: "addr_existing", reference: "cust_addr_1" },
          shipping_address: { id: "ship_existing", reference: "cust_addr_1" },
        },
        billingAddressCloneId: "cust_addr_1",
      })

      expect(result.success).toBe(true)
      // Billing clone ID is reused from the existing address ID
      expect(result.orderAttributes?._billing_address_clone_id).toBe("addr_existing")
      // Shipping clone ID is subsequently set by the !shipToDifferentAddress branch
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBe(true)
    })
  })

  describe("shipping address – ship to different address", () => {
    test("creates a new shipping address when shipToDifferentAddress=true", async () => {
      mockCreate
        .mockResolvedValueOnce({ id: "billing_new" })
        .mockResolvedValueOnce({ id: "shipping_new" })

      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: { first_name: "Biller" },
        shippingAddress: { first_name: "Shipper" },
        shipToDifferentAddress: true,
      })

      expect(result.success).toBe(true)
      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBeUndefined()
      expect(result.orderAttributes?.shipping_address).toEqual({
        id: "shipping_new",
        type: "addresses",
      })
    })

    test("updates an existing shipping address when shipToDifferentAddress=true", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: {
          ...baseOrder,
          shipping_address: { id: "ship_existing", reference: null },
        },
        shippingAddress: { first_name: "Updated Shipper" },
        shipToDifferentAddress: true,
      })

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "ship_existing",
        first_name: "Updated Shipper",
      })
      expect(result.orderAttributes?._refresh).toBe(true)
    })

    test("sets shipping clone ID when shipToDifferentAddress=true and shippingAddressCloneId is provided", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        shippingAddressCloneId: "cust_ship_1",
        shipToDifferentAddress: true,
      })

      expect(result.success).toBe(true)
      expect(result.orderAttributes?._shipping_address_clone_id).toBe("cust_ship_1")
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBeUndefined()
    })

    test("skips shipping when shipToDifferentAddress=false (no clone ID)", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: { first_name: "Biller" },
        shipToDifferentAddress: false,
      })

      expect(result.success).toBe(true)
      expect(result.orderAttributes?._shipping_address_same_as_billing).toBe(true)
      expect(mockCreate).toHaveBeenCalledTimes(1) // only billing
    })
  })

  describe("metadata sanitization", () => {
    test("moves metadata_ prefixed keys into metadata object", async () => {
      await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: {
          first_name: "John",
          metadata_custom_field: "value",
        },
      })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "John",
          metadata: { custom_field: "value" },
        })
      )
      expect(mockCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({ metadata_custom_field: expect.anything() })
      )
    })
  })

  describe("customer email", () => {
    test("includes customer email in orderAttributes", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        customerEmail: "test@example.com",
      })

      expect(result.success).toBe(true)
      expect(result.orderAttributes?.customer_email).toBe("test@example.com")
    })
  })

  describe("empty inputs", () => {
    test("returns success with minimal orderAttributes when no address data is provided", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
      })

      expect(result.success).toBe(true)
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(result.orderAttributes?.id).toBe("ord_1")
    })

    test("ignores empty billingAddress object", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: {},
      })

      expect(result.success).toBe(true)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    test("ignores empty shippingAddress when shipToDifferentAddress=true", async () => {
      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        shippingAddress: {},
        shipToDifferentAddress: true,
      })

      expect(result.success).toBe(true)
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe("error handling", () => {
    test("returns success=false and error when SDK throws", async () => {
      const sdkError = new Error("Network error")
      mockCreate.mockRejectedValueOnce(sdkError)

      const result = await saveOrderAddresses({
        accessToken: "token",
        order: baseOrder,
        billingAddress: { first_name: "John" },
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(sdkError)
      expect(result.orderAttributes).toBeUndefined()
    })
  })
})
