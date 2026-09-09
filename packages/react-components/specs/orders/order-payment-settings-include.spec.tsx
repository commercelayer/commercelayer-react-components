import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Order } from "#components/orders/Order"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import CommerceLayerContext from "#context/CommerceLayerContext"

const { retrieveMock } = vi.hoisted(() => ({ retrieveMock: vi.fn() }))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({
      orders: { retrieve: retrieveMock },
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  retrieveMock.mockResolvedValue({ id: "order-1", type: "orders", status: "pending" })
})

describe("<Order> order fetch", () => {
  // The whole Payments Model detection rests on this: an order that was never
  // asked for `available_payment_settings` is indistinguishable from an order
  // on the older model, and every consumer would silently take the wrong branch.
  it("asks for available_payment_settings even with no payment components mounted", async () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
        <Order orderId="order-1">
          <span />
        </Order>
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(retrieveMock).toHaveBeenCalled()
    })

    const params = retrieveMock.mock.calls.at(-1)?.[1]
    expect(params?.include).toContain("available_payment_settings")
  })

  // The other half: reading a selection back needs the session's setting, and
  // telling a live session from a burnt one needs its authorization. These are
  // registered by <PaymentSetting> and must reach the *initial* fetch —
  // registering an include after the order has loaded does not refetch, so a
  // late arrival would mean the data never comes.
  it("asks for the nested session relationships when <PaymentSetting> is mounted", async () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
        <Order orderId="order-1">
          <PaymentSetting>
            <span />
          </PaymentSetting>
        </Order>
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(retrieveMock).toHaveBeenCalled()
    })

    const params = retrieveMock.mock.calls.at(-1)?.[1]
    expect(params?.include).toContain("available_payment_settings")
    expect(params?.include).toContain("payment_sessions.payment_setting")
    expect(params?.include).toContain("payment_sessions.payment_authorization")
  })
})
