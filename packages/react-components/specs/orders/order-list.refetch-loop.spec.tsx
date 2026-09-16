import type { Order } from "@commercelayer/sdk"
import { render, waitFor } from "@testing-library/react"
import type { JSX } from "react"
import { Customer } from "#components/customers/Customer"
import { OrderList, type TOrderListColumn } from "#components/orders/OrderList"
import { OrderListRow } from "#components/orders/OrderListRow"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const core = vi.hoisted(() => ({
  getCustomerInfo: vi.fn(),
  getCustomerAddresses: vi.fn(),
  getCustomerPayments: vi.fn(),
  getCustomerPaymentSources: vi.fn(),
  deleteCustomerPayment: vi.fn(),
  deleteCustomerAddress: vi.fn(),
  createCustomerAddress: vi.fn(),
  getCustomerOrders: vi.fn(),
  getCustomerSubscriptions: vi.fn(),
  saveCustomerUser: vi.fn(),
  setResourceTrigger: vi.fn(),
}))

vi.mock("@commercelayer/core-components", () => ({
  getCustomerInfo: core.getCustomerInfo,
  getCustomerAddresses: core.getCustomerAddresses,
  getCustomerPayments: core.getCustomerPayments,
  getCustomerPaymentSources: core.getCustomerPaymentSources,
  deleteCustomerPayment: core.deleteCustomerPayment,
  deleteCustomerAddress: core.deleteCustomerAddress,
  createCustomerAddress: core.createCustomerAddress,
  getCustomerOrders: core.getCustomerOrders,
  getCustomerSubscriptions: core.getCustomerSubscriptions,
  saveCustomerUser: core.saveCustomerUser,
  setResourceTrigger: core.setResourceTrigger,
}))

const jwtMock = vi.hoisted(() => ({ jwt: vi.fn() }))
vi.mock("#utils/jwt", () => ({ jwt: jwtMock.jwt }))

const isGuestMock = vi.hoisted(() => ({ isGuestToken: vi.fn() }))
vi.mock("#utils/isGuestToken", () => ({ isGuestToken: isGuestMock.isGuestToken }))

const VALID_TOKEN = "valid-customer-token"
const CUSTOMER_ID = "cust-123"

const columns: TOrderListColumn[] = [{ header: "Number", accessorKey: "number" }]

/** The SDK returns an array carrying a `meta` property; OrderList reads `meta.recordCount`. */
function orderList(): Order[] {
  return Object.assign([{ id: "order-1", number: 1234 } as unknown as Order], {
    meta: { recordCount: 1, pageCount: 1 },
  })
}

/**
 * Mounted the way mfe-my-account mounts it: `columns` and `sortBy` are fresh
 * literals on every render, so nothing upstream is memoized for us.
 */
function renderOrdersPage(): JSX.Element {
  return render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider
      value={{ accessToken: VALID_TOKEN, interceptors: undefined } as any}
    >
      <OrderContext.Provider
        value={{ ...defaultOrderContext, addResourceToInclude: vi.fn() } as any}
      >
        <Customer>
          <OrderList columns={columns} sortBy={[{ id: "placed_at", desc: true }]}>
            <OrderListRow field="number" />
          </OrderList>
        </Customer>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  ) as unknown as JSX.Element
}

beforeEach(() => {
  vi.clearAllMocks()
  jwtMock.jwt.mockReturnValue({ owner: { id: CUSTOMER_ID } })
  isGuestMock.isGuestToken.mockReturnValue(false)
  core.getCustomerInfo.mockResolvedValue({
    customer: { id: CUSTOMER_ID, email: "user@example.com" },
    customerEmail: "user@example.com",
  })
  core.getCustomerAddresses.mockResolvedValue([])
  core.getCustomerPayments.mockResolvedValue([])
  core.getCustomerPaymentSources.mockReturnValue([])
  core.getCustomerOrders.mockResolvedValue(orderList())
})

describe("OrderList refetch loop", () => {
  it("fetches orders once — a settled fetch must not retrigger the effect that fired it", async () => {
    renderOrdersPage()

    await waitFor(() => {
      expect(core.getCustomerOrders).toHaveBeenCalled()
    })

    // Let every pending fetch, state update and re-render settle.
    for (let i = 0; i < 10; i++) {
      await waitFor(() => {
        expect(true).toBe(true)
      })
    }

    expect(core.getCustomerOrders).toHaveBeenCalledTimes(1)
  })
})
