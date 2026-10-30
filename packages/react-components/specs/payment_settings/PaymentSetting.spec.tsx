import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingManualPayment } from "#components/payment_settings/PaymentSettingManualPayment"
import { PaymentSettingName } from "#components/payment_settings/PaymentSettingName"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { resetPaymentGatewayStore, setCollecting } from "#utils/paymentGatewayStore"
import { ADYEN_RETURN_URL_MAX_LENGTH } from "#utils/paymentSettingCreateAttributes"

const { createPaymentSessionMock, discardPaymentSessionMock } = vi.hoisted(() => ({
  createPaymentSessionMock: vi.fn(),
  discardPaymentSessionMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    createPaymentSession: createPaymentSessionMock,
    discardPaymentSession: discardPaymentSessionMock,
  }
})

// A saved card is offered only to a signed-in customer, and the test token is
// not a real JWT — so who is signed in is decided here, per test.
const { guest } = vi.hoisted(() => ({ guest: { value: true } }))
vi.mock("#utils/isGuestToken", () => ({ isGuestToken: () => guest.value }))

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals", name: "Bank transfer" }
const STRIPE = { id: "ps-stripe", type: "payment_setting_stripes", name: "Stripe" }

function order(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [MANUAL],
    payment_sessions: [],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()
const addResourceToInclude = vi.fn()

function Wrapper({
  children,
  currentOrder,
}: {
  children: ReactNode
  currentOrder?: Partial<Order> | null
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: currentOrder ?? undefined,
            include: ["payment_sessions.payment_setting", "payment_sessions.payment_authorization"],
            includeLoaded: {
              "payment_sessions.payment_setting": true,
              "payment_sessions.payment_authorization": true,
            },
            addResourceToInclude,
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderSettings(currentOrder?: Partial<Order> | null) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingName data-testid="name" />
        <PaymentSettingManualPayment instructions={<span data-testid="instructions">IBAN</span>} />
      </PaymentSetting>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  guest.value = true
  createPaymentSessionMock.mockResolvedValue({ id: "session-new" })
  discardPaymentSessionMock.mockResolvedValue(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("PaymentSetting", () => {
  it("renders a setting from available_payment_settings", () => {
    renderSettings(order())
    expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    expect(screen.getByTestId("radio")).toBeTruthy()
  })

  // Self-silencing is what lets both payment trees be mounted side by side
  // without a coordinator above them.
  it("renders nothing when the order is on the payment_source model", () => {
    renderSettings(
      order({
        available_payment_settings: [],
        available_payment_methods: [{ id: "pm-1" }],
      } as never)
    )
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  it("renders nothing before the order has loaded", () => {
    renderSettings(null)
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  // A radio for a setting with no implementation behind it does nothing when
  // clicked, which is worse for the shopper than not offering it.
  it("skips settings it cannot drive yet", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderSettings(order({ available_payment_settings: [MANUAL, STRIPE] } as never))
    expect(screen.getAllByTestId("name")).toHaveLength(1)
    expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("payment_setting_stripes"))
  })

  describe("selection", () => {
    it("creates a Payment Session when the setting is chosen", async () => {
      renderSettings(order())
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })

      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalledWith(
          expect.objectContaining({ orderId: "order-1", paymentSettingId: "ps-manual" })
        )
      })
      // The order is the only source of truth for the selection, so it has to
      // be pulled back in before anything reflects the new session.
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })

    it("never sends amount_cents — the server sizes the session", async () => {
      renderSettings(order())
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalled()
      })
      expect(createPaymentSessionMock.mock.calls[0]?.[0]).not.toHaveProperty("amount_cents")
    })

    // Switching setting leaves the previous session on the order — it is never
    // deleted — so the newest one is what the radio group must follow.
    // Otherwise every setting the shopper ever tried reads as selected at once.
    it("follows the most recent session when the order carries several", () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-manual",
              status: "unpaid",
              created_at: "2026-08-18T10:00:00Z",
              payment_setting: MANUAL,
            },
            {
              id: "session-other",
              status: "unpaid",
              created_at: "2026-08-18T11:00:00Z",
              payment_setting: STRIPE,
            },
          ],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(false)
    })

    it("selects the setting whose session is the most recent", () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-other",
              status: "unpaid",
              created_at: "2026-08-18T10:00:00Z",
              payment_setting: STRIPE,
            },
            {
              id: "session-manual",
              status: "unpaid",
              created_at: "2026-08-18T11:00:00Z",
              payment_setting: MANUAL,
            },
          ],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(true)
    })

    // A failed authorization leaves the session `unpaid`, so status alone
    // cannot tell a fresh session from a burnt one.
    it("creates a new session when the existing one carries a failed authorization", async () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-1",
              status: "unpaid",
              payment_setting: MANUAL,
              payment_authorization: { status: "failed" },
            },
          ],
        } as never)
      )
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalledOnce()
      })
    })

    it("reads the selection back from the order, not from local state", () => {
      renderSettings(
        order({
          payment_sessions: [{ id: "session-1", status: "unpaid", payment_setting: MANUAL }],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(true)
      expect(screen.getByTestId("instructions")).toBeTruthy()
    })

    it("does not show the setting as chosen while no session exists", () => {
      renderSettings(order())
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(false)
      expect(screen.queryByTestId("instructions")).toBeNull()
    })

    it("ignores a click on the setting already chosen", async () => {
      renderSettings(
        order({
          payment_sessions: [{ id: "session-1", status: "unpaid", payment_setting: MANUAL }],
        } as never)
      )
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      expect(createPaymentSessionMock).not.toHaveBeenCalled()
    })
  })

  // Both trees can be mounted together with no coordinator above them. 2026-05
  // is additive, so an order on the newer model still carries
  // available_payment_methods — without this the shopper would see two sets of
  // payment options, one of them dead.
  describe("precedence over the payment_source tree", () => {
    it("silences <PaymentMethod> on the payment_sessions model", () => {
      render(
        <Wrapper
          currentOrder={
            {
              id: "order-1",
              available_payment_settings: [MANUAL],
              available_payment_methods: [
                { id: "pm-1", payment_source_type: "stripe_payments", name: "Stripe" },
              ],
              payment_sessions: [],
            } as never
          }
        >
          <PaymentMethod>
            <span data-testid="old-tree">old</span>
          </PaymentMethod>
          <PaymentSetting>
            <PaymentSettingName data-testid="name" />
          </PaymentSetting>
        </Wrapper>
      )
      expect(screen.queryByTestId("old-tree")).toBeNull()
      expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    })
  })

  // Gift cards live in <PaymentSettingGiftCard>: additive, not one of the
  // alternatives this group picks between. Skipped without a warning, unlike a
  // setting that genuinely has no implementation.
  it("leaves gift card settings to their own component, silently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderSettings(
      order({
        available_payment_settings: [
          MANUAL,
          { id: "ps-gift", type: "payment_setting_gift_cards", name: "Gift card" },
        ],
      } as never)
    )
    expect(screen.getAllByTestId("name")).toHaveLength(1)
    expect(warn).not.toHaveBeenCalled()
  })
})

// An application styling the chosen option, or making the whole card the click
// target, needs the selection outside the radio's own render prop.
describe("PaymentSetting children as a function", () => {
  it("hands each setting its state", () => {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          {({ setting, isSelected, isPending }) => (
            <div data-testid="card">{`${setting.id}|${isSelected}|${isPending}`}</div>
          )}
        </PaymentSetting>
      </Wrapper>
    )
    expect(screen.getByTestId("card").textContent).toBe("ps-manual|false|false")
  })

  // One click reaching both a card and the radio inside it must not leave two
  // Payment Sessions behind: `pendingSettingId` still reads as idle in the
  // second handler, so the guard cannot be state.
  it("ignores a second selection while one is in flight", async () => {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          {({ selectSetting }) => (
            <button
              type="button"
              data-testid="card"
              onClick={() => {
                void selectSetting()
                void selectSetting()
              }}
            />
          )}
        </PaymentSetting>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("card"))
    })

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledTimes(1)
    })
  })
})

/**
 * A payment under way locks the payment method. Switching would unmount the
 * gateway collecting it, which discards whatever it had in flight without
 * stopping the payment.
 */
describe("<PaymentSetting> while a payment is being collected", () => {
  const OTHER_MANUAL = { id: "ps-manual-2", type: "payment_setting_manuals", name: "Cash" }

  it("refuses to switch method, however the selection is made", async () => {
    setCollecting("order-1", true)
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          {({ selectSetting }) => (
            <button
              type="button"
              data-testid="card"
              onClick={() => {
                void selectSetting()
              }}
            />
          )}
        </PaymentSetting>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("card"))
    })

    expect(createPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("disables every radio for as long as the payment lasts", () => {
    renderSettings(order({ available_payment_settings: [MANUAL, OTHER_MANUAL] } as never))
    const radios = (): HTMLInputElement[] => screen.getAllByTestId("radio") as HTMLInputElement[]
    expect(radios().map((radio) => radio.disabled)).toEqual([false, false])

    act(() => {
      setCollecting("order-1", true)
    })
    expect(radios().map((radio) => radio.disabled)).toEqual([true, true])

    // A stuck selector is the failure that matters most: a shopper who cannot
    // change method and is not told why has no way out but a reload.
    act(() => {
      setCollecting("order-1", false)
    })
    expect(radios().map((radio) => radio.disabled)).toEqual([false, false])
  })

  it("tells the application why, so it can say so", () => {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          {({ isCollecting }) => <div data-testid="card">{String(isCollecting)}</div>}
        </PaymentSetting>
      </Wrapper>
    )
    expect(screen.getByTestId("card").textContent).toBe("false")

    act(() => {
      setCollecting("order-1", true)
    })
    expect(screen.getByTestId("card").textContent).toBe("true")
  })
})

/**
 * The first of the two waits behind `loader`: the Payment Session being
 * created. Each gateway component covers the second, its SDK painting, in its
 * own spec.
 */
describe("<PaymentSetting> loader", () => {
  const OTHER_MANUAL = { id: "ps-manual-2", type: "payment_setting_manuals", name: "Cash" }

  /** A session create that answers only when the test says so. */
  function deferCreate(): () => Promise<void> {
    let finish: (session: unknown) => void = () => undefined
    createPaymentSessionMock.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      })
    )
    return async () => {
      await act(async () => {
        finish({ id: "session-new" })
      })
    }
  }

  function renderWithLoader(manualLoader?: ReactNode) {
    return render(
      <Wrapper
        currentOrder={order({ available_payment_settings: [MANUAL, OTHER_MANUAL] } as never)}
      >
        <PaymentSetting loader={<span data-testid="loader" />}>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingManualPayment
            {...(manualLoader != null ? { loader: manualLoader as never } : {})}
          />
        </PaymentSetting>
      </Wrapper>
    )
  }

  it("shows under the setting being selected while its session is created", async () => {
    const finishCreate = deferCreate()
    renderWithLoader()
    expect(screen.queryByTestId("loader")).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("radio")[1] as HTMLElement)
    })
    // Once, under the setting clicked — not under every setting.
    expect(screen.getAllByTestId("loader")).toHaveLength(1)

    await finishCreate()
    await waitFor(() => {
      expect(screen.queryByTestId("loader")).toBeNull()
    })
  })

  it("gives way to a component's own loader", async () => {
    deferCreate()
    renderWithLoader(<span data-testid="own-loader" />)

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("radio")[0] as HTMLElement)
    })
    expect(screen.getByTestId("own-loader")).toBeTruthy()
    expect(screen.queryByTestId("loader")).toBeNull()
  })

  it("shows nothing when the application passes none", async () => {
    deferCreate()
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingManualPayment />
        </PaymentSetting>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })
    expect(screen.queryByTestId("loader")).toBeNull()
  })
})

/**
 * Switching setting clears what the shopper switched away from.
 *
 * The rule is `2026-08-20-gift-cards-as-payment-sessions.md`'s reformulation —
 * sessions that took no money are deleted, everything else is abandoned — which
 * the selection path had never implemented. Left undone, an order accumulated a
 * session per setting the shopper had ever tried.
 */
describe("<PaymentSetting> clearing the superseded session", () => {
  const ADYEN = { id: "ps-adyen", type: "payment_setting_adyens", name: "Adyen" }

  function withBoth(sessions: unknown[]) {
    return order({
      available_payment_settings: [MANUAL, ADYEN],
      payment_sessions: sessions,
    } as never)
  }

  async function clickManual() {
    await act(async () => {
      fireEvent.click(screen.getAllByTestId("radio")[0] as HTMLElement)
    })
  }

  it("deletes the session belonging to the setting just left", async () => {
    renderSettings(
      withBoth([
        {
          id: "session-adyen",
          status: "unpaid",
          created_at: "2026-09-08T10:57:54Z",
          payment_setting: ADYEN,
        },
      ])
    )

    await clickManual()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    expect(discardPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-adyen" })
    )
  })

  it("does nothing at all when the setting is already selected", async () => {
    // The radio ignores a click on the current selection, which is what keeps
    // the adopt branch — where the superseded session *is* the selection —
    // unreachable from a click. So the property worth pinning is that a stray
    // click destroys nothing.
    renderSettings(
      withBoth([
        {
          id: "session-manual",
          status: "unpaid",
          created_at: "2026-09-08T10:57:54Z",
          payment_setting: MANUAL,
        },
      ])
    )

    await clickManual()

    expect(createPaymentSessionMock).not.toHaveBeenCalled()
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("leaves a session that is holding money", async () => {
    // Not ours to undo from a radio button: the API refuses to delete a session
    // with transactions attached, and the money is a real record.
    renderSettings(
      withBoth([
        {
          id: "session-adyen",
          status: "authorized",
          created_at: "2026-09-08T10:57:54Z",
          payment_setting: ADYEN,
          payment_authorization: { status: "succeeded" },
        },
      ])
    )

    await clickManual()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("leaves a session whose gateway started collecting mid-switch", async () => {
    // The lock refuses a switch begun mid-payment, but not a payment begun
    // mid-switch: the old gateway stays on screen while the new session is
    // created, and the shopper can pay through it in that second. No
    // authorization exists yet, so the money test above says nothing and the
    // delete would go through — destroying the record the payment would settle
    // against, without stopping the payment.
    let finishCreate: (session: unknown) => void = () => undefined
    createPaymentSessionMock.mockReturnValue(
      new Promise((resolve) => {
        finishCreate = resolve
      })
    )
    renderSettings(
      withBoth([
        {
          id: "session-adyen",
          status: "unpaid",
          created_at: "2026-09-08T10:57:54Z",
          payment_setting: ADYEN,
        },
      ])
    )

    await clickManual()
    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    act(() => {
      setCollecting("order-1", true)
    })
    await act(async () => {
      finishCreate({ id: "session-new" })
    })

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalled()
    })
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("still completes the selection when the delete fails", async () => {
    // Tidying, not correctness: the newest session is the selection either way,
    // so a refused delete must not turn into a failed selection.
    discardPaymentSessionMock.mockRejectedValue(new Error("nope"))
    renderSettings(
      withBoth([
        {
          id: "session-adyen",
          status: "unpaid",
          created_at: "2026-09-08T10:57:54Z",
          payment_setting: ADYEN,
        },
      ])
    )

    await clickManual()

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })
    expect(screen.queryByTestId("error")).toBeNull()
  })
})

describe("PaymentSetting selection errors", () => {
  const BRAINTREE = { id: "ps-braintree", type: "payment_setting_braintrees", name: "Braintree" }

  function renderWithErrors(currentOrder: Partial<Order>) {
    return render(
      <Wrapper currentOrder={currentOrder}>
        <PaymentSetting>
          {({ setting, errors }) => (
            <div data-testid={`setting-${setting.id}`}>
              <PaymentSettingRadioButton data-testid={`radio-${setting.id}`} />
              {errors.length > 0 && (
                <span data-testid={`error-${setting.id}`}>
                  {errors.map((e) => e.message).join(" ")}
                </span>
              )}
            </div>
          )}
        </PaymentSetting>
      </Wrapper>
    )
  }

  it("reports the failure under the setting that failed only", async () => {
    createPaymentSessionMock.mockRejectedValue(new Error("boom"))
    renderWithErrors(order({ available_payment_settings: [MANUAL, BRAINTREE] } as never))

    fireEvent.click(screen.getByTestId(`radio-${BRAINTREE.id}`))

    await waitFor(() => {
      expect(screen.getByTestId(`error-${BRAINTREE.id}`).textContent).toBe("boom")
    })
    expect(screen.queryByTestId(`error-${MANUAL.id}`)).toBeNull()
  })

  it("carries the API's detail when the SDK error has no message", async () => {
    // What the SDK throws for a 500 on the session create: an ApiError whose
    // `message` is empty, with the API's errors alongside.
    const apiError = Object.assign(new Error(""), {
      errors: [{ title: "Invalid query", detail: "invalid query", status: "500" }],
    })
    createPaymentSessionMock.mockRejectedValue(apiError)
    renderWithErrors(order({ available_payment_settings: [MANUAL, BRAINTREE] } as never))

    fireEvent.click(screen.getByTestId(`radio-${BRAINTREE.id}`))

    await waitFor(() => {
      expect(screen.getByTestId(`error-${BRAINTREE.id}`).textContent).toBe("invalid query")
    })
  })

  it("clears the failure when another setting is picked", async () => {
    createPaymentSessionMock.mockRejectedValueOnce(new Error("boom"))
    renderWithErrors(order({ available_payment_settings: [MANUAL, BRAINTREE] } as never))

    fireEvent.click(screen.getByTestId(`radio-${BRAINTREE.id}`))
    await screen.findByTestId(`error-${BRAINTREE.id}`)

    fireEvent.click(screen.getByTestId(`radio-${MANUAL.id}`))

    await waitFor(() => {
      expect(screen.queryByTestId(`error-${BRAINTREE.id}`)).toBeNull()
    })
  })
})

/**
 * `returnUrl`, and why it is on this component.
 *
 * From gateway version 72 Adyen refuses a `returnUrl` over 1024 characters, and
 * a checkout carrying its access token in the query string exceeds that on the
 * token alone — a JWT here is around 1.5 kB. The refusal arrives as
 * `Field 'returnUrl' may not exceed 1024 characters` plus a collateral
 * `token - can't be blank`, neither of which names anything the application set.
 */
describe("<PaymentSetting> returnUrl", () => {
  const ADYEN = {
    id: "ps-adyen",
    type: "payment_setting_adyens",
    name: "Adyen",
    public_key: "test_ABC",
  }

  function renderAdyenOnly(returnUrl?: string) {
    return render(
      <Wrapper currentOrder={order({ available_payment_settings: [ADYEN] } as never)}>
        <PaymentSetting returnUrl={returnUrl}>
          <PaymentSettingRadioButton data-testid="radio" />
        </PaymentSetting>
      </Wrapper>
    )
  }

  async function clickIt() {
    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })
  }

  it("sends the one the application gave, verbatim", async () => {
    renderAdyenOnly("https://shop.example/checkout/o-1?paymentReturn=true")
    await clickIt()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          clientData: { return_url: "https://shop.example/checkout/o-1?paymentReturn=true" },
        })
      )
    })
  })

  it("warns when the one it would send cannot be used", async () => {
    // The failure it replaces named nothing an application had set: Adyen's
    // "may not exceed 1024 characters", plus a collateral "token - can't be
    // blank" from the session's own validation. The check sits here rather than
    // in the URL builder so it also covers a URL the application supplied.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const long = `https://shop.example/o-1?accessToken=${"e".repeat(1200)}`
    expect(long.length).toBeGreaterThan(ADYEN_RETURN_URL_MAX_LENGTH)

    renderAdyenOnly(long)
    await clickIt()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("over Adyen's limit"))
    warn.mockRestore()
  })

  it("says nothing about one that fits", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    renderAdyenOnly("https://shop.example/o-1?paymentReturn=true")
    await clickIt()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("falls back to the current location when the application says nothing", async () => {
    renderAdyenOnly()
    await clickIt()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    const [{ clientData }] = createPaymentSessionMock.mock.calls[0] as [
      { clientData?: { return_url?: string } },
    ]
    // jsdom serves the page from localhost, which is all this needs to assert:
    // the fallback is the page, not a configured value.
    expect(clientData?.return_url).toContain(window.location.origin)
  })
})

/**
 * Saving a card, through `vaulting` on the Payment Session.
 *
 * Commerce Layer stores the card during the charge and creates the
 * `payment_wallet` itself, so what the library owns is only *asking* — at
 * creation, because `vaulting` cannot be patched in later — and asking only for
 * a signed-in customer.
 */
describe("<PaymentSetting> saving a card", () => {
  const ADYEN = {
    id: "ps-adyen",
    type: "payment_setting_adyens",
    name: "Adyen",
    public_key: "test_A",
  }
  const STRIPE_WITH_KEY = { ...STRIPE, public_key: "pk_test_A" }
  const BRAINTREE = { id: "ps-braintree", type: "payment_setting_braintrees", name: "Braintree" }
  const PAYPAL = {
    id: "ps-paypal",
    type: "payment_setting_paypals",
    name: "PayPal",
    client_id: "paypal-client-id",
  }

  // Refused without them whenever the account is stored, though PayPal's popup
  // never sends anyone to either — and the page's query string can carry the
  // access token, which has no business reaching PayPal.
  it("gives PayPal the page as its return and cancel URLs, without the query string", async () => {
    window.history.replaceState(null, "", "/checkout/order-1?accessToken=secret")
    renderSettings(order({ available_payment_settings: [PAYPAL] } as never))

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    const page = `${window.location.origin}/checkout/order-1`
    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentSettingId: "ps-paypal",
          clientData: { return_url: page, cancel_url: page },
        })
      )
    })
    window.history.replaceState(null, "", "/")
  })

  function stripeSession(overrides: Record<string, unknown> = {}) {
    return {
      id: "session-stripe",
      status: "unpaid",
      created_at: "2026-09-29T10:00:00Z",
      payment_setting: STRIPE_WITH_KEY,
      ...overrides,
    }
  }

  type Captured = {
    canSaveCard: boolean
    saveCard: boolean
    setSaveCard: (value: boolean) => Promise<void>
  }

  /** Render the settings and keep each one's render-prop state by setting id. */
  function renderCapturing(currentOrder: Partial<Order>) {
    const captured: Record<string, Captured> = {}
    render(
      <Wrapper currentOrder={currentOrder}>
        <PaymentSetting>
          {({ setting, canSaveCard, saveCard, setSaveCard }) => {
            captured[setting.id] = { canSaveCard, saveCard, setSaveCard }
            return <PaymentSettingRadioButton data-testid={`radio-${setting.id}`} />
          }}
        </PaymentSetting>
      </Wrapper>
    )
    return captured
  }

  it("asks Adyen to store the card for a signed-in customer, whose Drop-in then asks them", async () => {
    guest.value = false
    renderSettings(order({ available_payment_settings: [ADYEN] } as never))

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ vaulting: true })
      )
    })
  })

  it("never asks for a guest, whose order's customer is just whoever typed the email", async () => {
    renderSettings(order({ available_payment_settings: [ADYEN] } as never))

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio"))
    })

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ vaulting: false })
      )
    })
  })

  it("offers the choice on Stripe, Braintree and PayPal to a signed-in customer, and nowhere else", () => {
    guest.value = false
    const captured = renderCapturing(
      order({
        available_payment_settings: [MANUAL, ADYEN, STRIPE_WITH_KEY, BRAINTREE, PAYPAL],
      } as never)
    )
    expect(captured["ps-stripe"]?.canSaveCard).toBe(true)
    // Hosted Fields are bare inputs: there is no checkbox of Braintree's own.
    expect(captured["ps-braintree"]?.canSaveCard).toBe(true)
    // PayPal's window asks for future payments only once the session has.
    expect(captured["ps-paypal"]?.canSaveCard).toBe(true)
    // Adyen's Drop-in has a checkbox of its own; a second one would ask twice.
    expect(captured["ps-adyen"]?.canSaveCard).toBe(false)
    expect(captured["ps-manual"]?.canSaveCard).toBe(false)
  })

  it("does not offer it to a guest", () => {
    const captured = renderCapturing(
      order({ available_payment_settings: [STRIPE_WITH_KEY] } as never)
    )
    expect(captured["ps-stripe"]?.canSaveCard).toBe(false)
  })

  it("reads the choice back from the session, so a reload keeps it", () => {
    guest.value = false
    const captured = renderCapturing(
      order({
        available_payment_settings: [STRIPE_WITH_KEY],
        payment_sessions: [stripeSession({ vaulting: true })],
      } as never)
    )
    expect(captured["ps-stripe"]?.saveCard).toBe(true)
  })

  it("replaces the session when the shopper changes their mind", async () => {
    // `vaulting` is fixed at creation, so there is nothing to patch: a new
    // session carries the choice, and the one it replaces is cleared.
    guest.value = false
    const captured = renderCapturing(
      order({
        available_payment_settings: [STRIPE_WITH_KEY],
        payment_sessions: [stripeSession({ vaulting: false })],
      } as never)
    )

    await act(async () => {
      await captured["ps-stripe"]?.setSaveCard(true)
    })

    expect(createPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSettingId: "ps-stripe", vaulting: true })
    )
    expect(discardPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-stripe" })
    )
  })

  it("shows the new choice at once, while the replacement is still on its way", async () => {
    // A checkbox that does not move for the second the API takes reads as a
    // click that was ignored.
    guest.value = false
    let finish: (value: unknown) => void = () => {}
    createPaymentSessionMock.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      })
    )
    const captured = renderCapturing(
      order({
        available_payment_settings: [STRIPE_WITH_KEY],
        payment_sessions: [stripeSession({ vaulting: false })],
      } as never)
    )

    let pending: Promise<void> | undefined
    act(() => {
      pending = captured["ps-stripe"]?.setSaveCard(true)
    })
    await waitFor(() => {
      expect(captured["ps-stripe"]?.saveCard).toBe(true)
    })

    await act(async () => {
      finish({ id: "session-new" })
      await pending
    })
  })

  it("does nothing when the choice is already the session's", async () => {
    guest.value = false
    const captured = renderCapturing(
      order({
        available_payment_settings: [STRIPE_WITH_KEY],
        payment_sessions: [stripeSession({ vaulting: true })],
      } as never)
    )

    await act(async () => {
      await captured["ps-stripe"]?.setSaveCard(true)
    })

    expect(createPaymentSessionMock).not.toHaveBeenCalled()
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("leaves the session alone while its payment is in flight", async () => {
    // The money would settle against the session being replaced, and the
    // replacement would carry nothing.
    guest.value = false
    setCollecting("order-1", true)
    const captured = renderCapturing(
      order({
        available_payment_settings: [STRIPE_WITH_KEY],
        payment_sessions: [stripeSession({ vaulting: false })],
      } as never)
    )

    await act(async () => {
      await captured["ps-stripe"]?.setSaveCard(true)
    })

    expect(createPaymentSessionMock).not.toHaveBeenCalled()
  })

  describe("renewing a session", () => {
    /** Keep each setting's `renewPaymentSession`, which only gateway components see. */
    function renderRenewing(currentOrder: Partial<Order>) {
      const renew: Record<string, () => Promise<void>> = {}
      function Capture() {
        const { setting, renewPaymentSession } = useContext(PaymentSettingChildrenContext)
        if (setting != null && renewPaymentSession != null) renew[setting.id] = renewPaymentSession
        return null
      }
      render(
        <Wrapper currentOrder={currentOrder}>
          <PaymentSetting>
            <Capture />
          </PaymentSetting>
        </Wrapper>
      )
      return renew
    }

    function braintreeSession(overrides: Record<string, unknown> = {}) {
      return {
        id: "session-braintree",
        status: "unpaid",
        created_at: "2026-10-23T10:00:00Z",
        payment_setting: BRAINTREE,
        ...overrides,
      }
    }

    it("keeps the save-card choice on the session that replaces an expired one", async () => {
      // Nothing on screen would tell the shopper the choice was dropped; the
      // first they would hear of it is a card missing from the next checkout.
      guest.value = false
      const renew = renderRenewing(
        order({
          available_payment_settings: [BRAINTREE],
          payment_sessions: [braintreeSession({ vaulting: true })],
        } as never)
      )

      await act(async () => {
        await renew["ps-braintree"]?.()
      })

      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ paymentSettingId: "ps-braintree", vaulting: true })
      )
    })

    it("does not add a choice the shopper never made", async () => {
      guest.value = false
      const renew = renderRenewing(
        order({
          available_payment_settings: [BRAINTREE],
          payment_sessions: [braintreeSession({ vaulting: false })],
        } as never)
      )

      await act(async () => {
        await renew["ps-braintree"]?.()
      })

      expect(createPaymentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ paymentSettingId: "ps-braintree", vaulting: false })
      )
    })
  })

  it("starts unticked when Stripe is selected afresh", async () => {
    // Switching back re-creates the session; nothing the shopper did there is
    // carried over, so it starts unticked rather than storing a card unasked.
    guest.value = false
    renderCapturing(
      order({
        available_payment_settings: [MANUAL, STRIPE_WITH_KEY],
        payment_sessions: [
          {
            id: "session-manual",
            status: "unpaid",
            created_at: "2026-09-29T10:00:00Z",
            payment_setting: MANUAL,
          },
        ],
      } as never)
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("radio-ps-stripe"))
    })

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalled()
    })
    expect(createPaymentSessionMock.mock.calls[0]?.[0]).not.toHaveProperty("vaulting")
  })
})
