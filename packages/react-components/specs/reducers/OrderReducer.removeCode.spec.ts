import type { Order } from "@commercelayer/sdk"
import { describe, expect, it, vi } from "vitest"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import { type OrderActions, removeGiftCardOrCouponCode } from "#reducers/OrderReducer"

const core = vi.hoisted(() => ({ getSdk: vi.fn() }))

vi.mock("@commercelayer/core-components", () => ({ getSdk: core.getSdk }))

/**
 * `updateOrder` does not throw: on failure it dispatches the errors and returns
 * `{ success: false }`. The remover must pass that on, not clear the errors and
 * report success while the code is still applied (#961).
 */
describe("removeGiftCardOrCouponCode", () => {
  it("reports failure and keeps the errors when the order update fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    core.getSdk.mockReturnValue({
      orders: {
        update: vi.fn().mockRejectedValue({
          errors: [{ code: "VALIDATION_ERROR", detail: "cannot remove", title: "invalid" }],
        }),
      },
    })
    const dispatch = vi.fn<(action: OrderActions) => void>()

    const result = await removeGiftCardOrCouponCode({
      codeType: "coupon_code",
      dispatch,
      config: { accessToken: "token" } as CommerceLayerConfig,
      order: { id: "order-1" } as Order,
    })

    expect(result).toEqual({ success: false })
    const errorDispatches = dispatch.mock.calls
      .map(([action]) => action)
      .filter((action) => action.type === "setErrors")
    expect(errorDispatches.length).toBeGreaterThan(0)
    expect(errorDispatches.at(-1)?.payload.errors).not.toEqual([])
  })
})
