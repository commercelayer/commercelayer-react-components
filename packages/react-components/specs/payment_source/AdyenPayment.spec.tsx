// Regression coverage for the partial gift-card authorization flow. When an Adyen gift card
// covers only part of the order, the Drop-in is refreshed once for the remaining amount via
// Core's `update()`. It used to be `mount()`ed again instead, which re-rendered it with the
// *old* amount — losing the shopper's selection for no benefit — and did so repeatedly.
import { act, fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import PaymentGateway from "#components/payment_gateways/PaymentGateway"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import { AdyenPayment } from "#components/payment_source/AdyenPayment"
import { PaymentSource } from "#components/payment_source/PaymentSource"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"

const TEST_TOKEN = "test-token"

const adyen = vi.hoisted(() => ({
  coreUpdate: vi.fn(),
  dropinMount: vi.fn(),
  dropinRemove: vi.fn(),
  dropinSubmit: vi.fn(),
  // The Core configuration the component builds, so tests can invoke the real
  // `onSubmit` handler it installs.
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { options: null as any, dropinOptions: null as any },
}))

vi.mock("@adyen/adyen-web/auto", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  AdyenCheckout: vi.fn(async (options: any) => {
    adyen.captured.options = options
    return { update: adyen.coreUpdate }
  }),
  Dropin: class FakeDropin {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    constructor(_core: any, options: any) {
      adyen.captured.dropinOptions = options
    }
    mount(selector: string): this {
      adyen.dropinMount(selector)
      return this
    }
    submit(): void {
      adyen.dropinSubmit()
    }
    remove(): void {
      adyen.dropinRemove()
    }
    unmount(): this {
      return this
    }
    handleAction(): void {}
  },
}))

// <AdyenGateway> derives the Adyen environment from the access token; the test token is not
// a real JWT.
vi.mock("#utils/jwt", () => ({
  jwt: () => ({ test: true }),
}))

vi.mock("#utils/getPublicIp", () => ({
  getPublicIP: vi.fn(async () => "127.0.0.1"),
}))

// biome-ignore lint/suspicious/noExplicitAny: test cast
const ORDER: any = {
  id: "order-1",
  currency_code: "EUR",
  country_code: "IT",
  language_code: "en-US",
  status: "pending",
  payment_status: "unpaid",
  total_amount_with_taxes_cents: 1000,
  line_items: [],
}

/** Adyen's payment_methods payload, so the component does not log a config error. */
const PAYMENT_SOURCE = {
  id: "ps-1",
  type: "adyen_payments",
  payment_methods: {
    paymentMethods: [{ type: "giftcard" }, { type: "scheme" }],
  },
}

function Providers({
  children,
  order = ORDER,
  paymentSource = PAYMENT_SOURCE,
  placeOrderStatus = "standby",
  updateOrder,
  getOrderByFields = vi.fn().mockResolvedValue({ status: "pending", payment_status: "unpaid" }),
  setPaymentSource,
  setPaymentMethodErrors = vi.fn(),
  setPaymentRef = vi.fn(),
  placeOrderButtonRef,
}: {
  children: ReactNode
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  paymentSource?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  placeOrderStatus?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  updateOrder?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  getOrderByFields?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentSource?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentMethodErrors?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentRef?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  placeOrderButtonRef?: any
}) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const paymentMethodCtx: any = {
    ...defaultPaymentMethodContext,
    _isProvided: true as const,
    paymentSource,
    currentPaymentMethodType: "giftcard",
    setPaymentSource,
    setPaymentMethodErrors,
    setPaymentRef,
    errors: [],
  }
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: order.id,
          order,
          updateOrder,
          getOrderByFields,
        }}
      >
        <CustomerContext.Provider value={{}}>
          <PlaceOrderContext.Provider
            value={{ ...defaultPlaceOrderContext, status: placeOrderStatus, placeOrderButtonRef }}
          >
            <PaymentMethodContext.Provider value={paymentMethodCtx}>
              {children}
            </PaymentMethodContext.Provider>
          </PlaceOrderContext.Provider>
        </CustomerContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

/** Resolves every pending promise chain kicked off by the component. */
async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

/**
 * Mounts the Drop-in, then submits a gift card. `balance` is what the gift card is worth
 * and `orderAfterAuthorization` is the order the API returns from the authorize call.
 */
async function submitGiftCard({
  balance,
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  orderAfterAuthorization,
}: {
  balance: number
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  orderAfterAuthorization: any
}): Promise<{ resolve: ReturnType<typeof vi.fn>; reject: ReturnType<typeof vi.fn> }> {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const setPaymentSource = vi.fn(async ({ attributes }: any) => {
    if (attributes?._balance) return { ...PAYMENT_SOURCE, balance }
    return { ...PAYMENT_SOURCE, payment_response: {} }
  })
  const updateOrder = vi.fn().mockResolvedValue({ order: orderAfterAuthorization })

  await act(async () => {
    render(
      <Providers setPaymentSource={setPaymentSource} updateOrder={updateOrder}>
        <AdyenPayment
          clientKey="test_CLIENTKEY"
          config={{
            giftcardErrorComponent: (message) => <span data-testid="gc-error">{message}</span>,
          }}
        />
      </Providers>
    )
  })
  await flush()

  const actions = { resolve: vi.fn(), reject: vi.fn() }
  await act(async () => {
    adyen.captured.options.onSubmit(
      { data: { paymentMethod: { type: "giftcard" } }, isValid: true },
      { mount: vi.fn() },
      actions
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  return actions
}

describe("AdyenPayment gift card partial authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("updates the mounted Drop-in with the remaining amount instead of remounting it", async () => {
    const actions = await submitGiftCard({
      balance: 400,
      orderAfterAuthorization: {
        ...ORDER,
        payment_status: "partially_authorized",
        // The Commerce Layer gift-card total stays 0 — an Adyen gift card authorized via
        // `_authorization_amount_cents` is not a `gift_card` resource.
        gift_card_amount_cents: 0,
        payment_source: { payment_response: { resultCode: "Authorised" } },
      },
    })

    expect(actions.resolve).toHaveBeenCalledWith({ resultCode: "Authorised" })
    // 1000 total - 400 authorized by the gift card
    expect(adyen.coreUpdate).toHaveBeenCalledWith(
      { amount: { currency: "EUR", value: 600 } },
      { shouldReinitializeCheckout: true }
    )
    // Mounted once at initialization and never again
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    expect(adyen.dropinMount).toHaveBeenCalledWith("#adyen-dropin")
  })

  it("prefers Adyen's own remainingAmount when the response carries one", async () => {
    await submitGiftCard({
      balance: 400,
      orderAfterAuthorization: {
        ...ORDER,
        payment_status: "partially_authorized",
        payment_source: {
          payment_response: {
            resultCode: "Authorised",
            order: { remainingAmount: { currency: "EUR", value: 550 } },
          },
        },
      },
    })

    expect(adyen.coreUpdate).toHaveBeenCalledWith(
      { amount: { currency: "EUR", value: 550 } },
      { shouldReinitializeCheckout: true }
    )
  })

  it("does not touch the amount when the gift card covers the whole order", async () => {
    const actions = await submitGiftCard({
      balance: 1000,
      orderAfterAuthorization: {
        ...ORDER,
        payment_status: "authorized",
        payment_source: { payment_response: { resultCode: "Authorised" } },
      },
    })

    expect(actions.resolve).toHaveBeenCalledWith({ resultCode: "Authorised" })
    expect(adyen.coreUpdate).not.toHaveBeenCalled()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
  })

  it("removes the Adyen instance on unmount so a remount can re-initialize", async () => {
    const setPaymentSource = vi.fn(async () => PAYMENT_SOURCE)
    const { unmount } = render(
      <Providers setPaymentSource={setPaymentSource} updateOrder={vi.fn()}>
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // Without this the ref kept pointing at a destroyed Drop-in and the `!dropinRef.current`
    // init guard left the component wired to it forever.
    unmount()
    expect(adyen.dropinRemove).toHaveBeenCalledTimes(1)
  })

  it("rejects and surfaces an error for a gift card with no balance", async () => {
    const actions = await submitGiftCard({
      balance: 0,
      orderAfterAuthorization: ORDER,
    })

    expect(actions.reject).toHaveBeenCalled()
    expect(actions.resolve).not.toHaveBeenCalled()
    expect(adyen.coreUpdate).not.toHaveBeenCalled()
    expect(screen.getByTestId("gc-error").textContent).toContain("no balance")
  })
})

// `Dropin.submit()` throws synchronously when it has no `activePaymentMethod`. Because
// `handleSubmit` is async that became a rejected promise which <PlaceOrderButton> awaited
// without a catch, so it surfaced as `unhandledRejection: Error: No active payment method.`
// and took the page (and the Playwright run) down instead of telling the shopper anything.
describe("AdyenPayment submit with no active payment method", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
    adyen.dropinSubmit.mockReset()
  })

  it("surfaces the Adyen error instead of rejecting", async () => {
    adyen.dropinSubmit.mockImplementation(() => {
      throw new Error("No active payment method.")
    })
    const setPaymentMethodErrors = vi.fn()

    const { container } = render(
      <Providers
        setPaymentSource={vi.fn(async () => PAYMENT_SOURCE)}
        updateOrder={vi.fn()}
        setPaymentMethodErrors={setPaymentMethodErrors}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )
    await flush()

    const form = container.querySelector("form")
    expect(form).not.toBeNull()

    // Must not throw and must not leave a rejected promise behind.
    await act(async () => {
      fireEvent.submit(form as HTMLFormElement)
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(setPaymentMethodErrors).toHaveBeenCalledWith([
      expect.objectContaining({
        resource: "payment_methods",
        message: "No active payment method.",
      }),
    ])
  })

  it("does not report an error when submit succeeds", async () => {
    const setPaymentMethodErrors = vi.fn()

    const { container } = render(
      <Providers
        setPaymentSource={vi.fn(async () => PAYMENT_SOURCE)}
        updateOrder={vi.fn()}
        setPaymentMethodErrors={setPaymentMethodErrors}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )
    await flush()

    await act(async () => {
      fireEvent.submit(container.querySelector("form") as HTMLFormElement)
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(adyen.dropinSubmit).toHaveBeenCalledTimes(1)
    expect(setPaymentMethodErrors).not.toHaveBeenCalled()
  })
})

// The reported glitch: "when the order updates the Adyen component keeps reloading".
// Re-initializing means a fresh AdyenCheckout() + new Dropin().mount(), which throws the
// shopper's selection away and re-fetches translations/analytics. An order update must not
// cause it.
describe("AdyenPayment stability across order updates", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("does not re-initialize when the payment source is recreated by an order update", async () => {
    const setPaymentSource = vi.fn(async () => PAYMENT_SOURCE)
    const tree = (
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      paymentSource: any
    ) => (
      <Providers
        setPaymentSource={setPaymentSource}
        updateOrder={vi.fn()}
        paymentSource={paymentSource}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )

    const { rerender } = render(tree(PAYMENT_SOURCE))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // What <PaymentGateway> does on a mismatched amount: create a brand new payment source.
    // New id and new object identity, same Adyen account so the same `public_key`.
    await act(async () => {
      rerender(tree({ ...PAYMENT_SOURCE, id: "ps-2", mismatched_amounts: false }))
    })
    await flush()

    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    expect(adyen.dropinRemove).not.toHaveBeenCalled()
  })

  it("does not re-initialize across a place-order status round trip", async () => {
    const setPaymentSource = vi.fn(async () => PAYMENT_SOURCE)
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const tree = (placeOrderStatus: any) => (
      <Providers
        setPaymentSource={setPaymentSource}
        updateOrder={vi.fn()}
        placeOrderStatus={placeOrderStatus}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )

    const { rerender } = render(tree("standby"))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // `status` is a dependency of the main effect, so this fires its cleanup and body again.
    for (const status of ["placing", "standby"]) {
      await act(async () => {
        rerender(tree(status))
      })
      await flush()
    }

    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    expect(adyen.dropinRemove).not.toHaveBeenCalled()
  })
})

// Refreshing the Drop-in once, when the order becomes partially authorized, is intended: the
// shopper now owes a smaller amount. Refreshing it repeatedly for the same authorization is
// the glitch — it discards the selection and re-fetches translations/analytics each time.
describe("AdyenPayment partial-authorization refresh happens once", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("refreshes once even if the gift card is submitted again for the same source", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const setPaymentSource = vi.fn(async ({ attributes }: any) => {
      if (attributes?._balance) return { ...PAYMENT_SOURCE, balance: 400 }
      return { ...PAYMENT_SOURCE, payment_response: {} }
    })
    const updateOrder = vi.fn().mockResolvedValue({
      order: {
        ...ORDER,
        payment_status: "partially_authorized",
        payment_source: { payment_response: { resultCode: "Authorised" } },
      },
    })

    await act(async () => {
      render(
        <Providers setPaymentSource={setPaymentSource} updateOrder={updateOrder}>
          <AdyenPayment clientKey="test_CLIENTKEY" />
        </Providers>
      )
    })
    await flush()

    const submitOnce = async (): Promise<void> => {
      const actions = { resolve: vi.fn(), reject: vi.fn() }
      await act(async () => {
        adyen.captured.options.onSubmit(
          { data: { paymentMethod: { type: "giftcard" } }, isValid: true },
          { mount: vi.fn() },
          actions
        )
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }

    await submitOnce()
    expect(adyen.coreUpdate).toHaveBeenCalledTimes(1)

    // Three more passes over the same authorization — repeated effect passes, a retry, an
    // order refetch that lands on the same partially-authorized state.
    await submitOnce()
    await submitOnce()
    await submitOnce()

    // Still exactly one refresh, and the Drop-in was never remounted.
    expect(adyen.coreUpdate).toHaveBeenCalledTimes(1)
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    expect(adyen.dropinRemove).not.toHaveBeenCalled()
  })
})

// The refresh resets the Drop-in's `activePaymentMethod`, so the form genuinely is not
// submittable until the shopper picks a method again. Leaving `ref.current.onsubmit` patched
// is what let <PlaceOrderButton> call `Dropin.submit()` on an empty Drop-in.
describe("AdyenPayment disarms the submit wiring on refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("clears the payment ref when the Drop-in is refreshed", async () => {
    const setPaymentRef = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const setPaymentSource = vi.fn(async ({ attributes }: any) => {
      if (attributes?._balance) return { ...PAYMENT_SOURCE, balance: 400 }
      return { ...PAYMENT_SOURCE, payment_response: {} }
    })
    const updateOrder = vi.fn().mockResolvedValue({
      order: {
        ...ORDER,
        payment_status: "partially_authorized",
        payment_source: { payment_response: { resultCode: "Authorised" } },
      },
    })

    await act(async () => {
      render(
        <Providers
          setPaymentSource={setPaymentSource}
          updateOrder={updateOrder}
          setPaymentRef={setPaymentRef}
        >
          <AdyenPayment clientKey="test_CLIENTKEY" />
        </Providers>
      )
    })
    await flush()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      adyen.captured.options.onSubmit(
        { data: { paymentMethod: { type: "giftcard" } }, isValid: true },
        { mount: vi.fn() },
        actions
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(adyen.coreUpdate).toHaveBeenCalledTimes(1)
    expect(setPaymentRef).toHaveBeenCalledWith({ ref: { current: null } })
  })
})

// The real cost of the loader swap, measured through the real <PaymentGateway>: it used to
// return `loaderComponent` instead of the gateway, unmounting the Adyen Drop-in and forcing a
// full re-initialization on the way back. `status: "placing"` is one of the flips that does it.
describe("PaymentGateway keeps the Adyen Drop-in mounted across loading flips", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("does not unmount the Drop-in when the place-order status flips", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const order: any = {
      ...ORDER,
      payment_method: { id: "pm-1", payment_source_type: "adyen_payments" },
      payment_source: { id: "ps-1", mismatched_amounts: false },
    }
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const source: any = { ...PAYMENT_SOURCE, public_key: "test_CLIENTKEY" }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const tree = (placeOrderStatus: any) => (
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <CommerceLayerContext.Provider value={{ accessToken: TEST_TOKEN } as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <OrderContext.Provider value={{ order, updateOrder: vi.fn() } as any}>
          {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
          <CustomerContext.Provider value={{} as any}>
            {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
            <PlaceOrderContext.Provider value={{ status: placeOrderStatus } as any}>
              <PaymentMethodChildrenContext.Provider
                value={
                  {
                    payment: { id: "pm-1", payment_source_type: "adyen_payments" },
                    expressPayments: false,
                    // biome-ignore lint/suspicious/noExplicitAny: test cast
                  } as any
                }
              >
                <PaymentMethodContext.Provider
                  value={
                    {
                      currentPaymentMethodId: "pm-1",
                      currentPaymentMethodType: "adyen_payments",
                      config: {},
                      setPaymentSource: vi.fn(async () => source),
                      paymentSource: source,
                      paymentMethods: [{ id: "pm-1" }],
                      errors: [],
                      setPaymentMethodErrors: vi.fn(),
                      setPaymentRef: vi.fn(),
                      // biome-ignore lint/suspicious/noExplicitAny: test cast
                    } as any
                  }
                >
                  <PaymentGateway show showCard={false} handleEditClick={() => {}} />
                </PaymentMethodContext.Provider>
              </PaymentMethodChildrenContext.Provider>
            </PlaceOrderContext.Provider>
          </CustomerContext.Provider>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )

    const { rerender } = render(tree("standby"))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // `status === "placing"` sets loading true inside PaymentGateway.
    await act(async () => {
      rerender(tree("placing"))
    })
    await flush()
    await act(async () => {
      rerender(tree("standby"))
    })
    await flush()

    // Never torn down, never re-initialized.
    expect(adyen.dropinRemove).not.toHaveBeenCalled()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
  })
})

// End-to-end through the real chain: <PaymentMethod> → <PaymentSource> → <PaymentGateway> →
// <AdyenGateway> → <AdyenPayment>. Both <PaymentMethod> and <PaymentGateway> implement their
// loader by replacing the subtree, so either one flipping `loading` used to tear the Drop-in
// down and re-initialize it. This is the "keeps reloading" glitch, measured where it happens.
describe("the real payment chain keeps the Adyen Drop-in mounted", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("survives the order updates of a partial gift-card authorization", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const source: any = { ...PAYMENT_SOURCE, public_key: "test_CLIENTKEY" }
    const baseOrder = {
      ...ORDER,
      payment_method: { id: "pm-1", payment_source_type: "adyen_payments" },
      available_payment_methods: [
        { id: "pm-1", payment_source_type: "adyen_payments", name: "Adyen" },
      ],
      payment_source: { id: "ps-1", mismatched_amounts: false },
    }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const tree = (order: any) => (
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <CommerceLayerContext.Provider value={{ accessToken: TEST_TOKEN } as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <OrderContext.Provider
          value={{ ...defaultOrderContext, order, updateOrder: vi.fn() } as any}
        >
          {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
          <CustomerContext.Provider value={{} as any}>
            {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
            <PlaceOrderContext.Provider value={{ status: "standby" } as any}>
              <PaymentMethodContext.Provider
                value={
                  {
                    ...defaultPaymentMethodContext,
                    _isProvided: true as const,
                    currentPaymentMethodId: "pm-1",
                    currentPaymentMethodType: "adyen_payments",
                    config: {},
                    setPaymentSource: vi.fn(async () => source),
                    paymentSource: source,
                    paymentMethods: baseOrder.available_payment_methods,
                    errors: [],
                    setPaymentMethodErrors: vi.fn(),
                    setPaymentRef: vi.fn(),
                    setPaymentMethod: vi.fn(),
                    setLoading: vi.fn(),
                    // biome-ignore lint/suspicious/noExplicitAny: test cast
                  } as any
                }
              >
                <PaymentMethod showLoader loader={<span data-testid="loader">Loading</span>}>
                  <PaymentSource>
                    <span data-testid="pm-child" />
                  </PaymentSource>
                </PaymentMethod>
              </PaymentMethodContext.Provider>
            </PlaceOrderContext.Provider>
          </CustomerContext.Provider>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )

    const { rerender } = render(tree(baseOrder))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // The order updates a partial gift-card authorization produces, in order: the payment
    // response lands first (the balance check refetches the order), then the authorization
    // flips payment_status, then the amounts read as mismatched.
    const updates = [
      { ...baseOrder, payment_source: { id: "ps-1", payment_response: { status: "authorized" } } },
      {
        ...baseOrder,
        payment_status: "partially_authorized",
        payment_source: { id: "ps-1", payment_response: { status: "authorized" } },
      },
      {
        ...baseOrder,
        payment_status: "partially_authorized",
        payment_source: {
          id: "ps-1",
          mismatched_amounts: true,
          payment_response: { status: "authorized" },
        },
      },
    ]
    for (const order of updates) {
      await act(async () => {
        rerender(tree(order))
      })
      await flush()
    }

    // One mount, never torn down — no matter how the order churned underneath.
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    expect(adyen.dropinRemove).not.toHaveBeenCalled()
  })
})

// Adyen's session — the `order_data` that expires after a minute — is baked into the Drop-in
// at creation. When the API rejects a call because it expired, the reducer destroys the
// payment source and a fresh one takes its place, and the instance on screen is left talking
// to a session the API now refuses. It has to be rebuilt, or the shopper's retry can never
// succeed. This is the one case that may rebuild: the test above pins down that an ordinary
// order update must NOT.
describe("AdyenPayment expired Adyen session", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("rebuilds the Drop-in against the replacement payment source", async () => {
    // What setPaymentSource returns once the API answers 422 "order_data - is expired":
    // the reducer swallows the error and hands back undefined.
    const setPaymentSource = vi.fn(async () => undefined)
    const setPaymentMethodErrors = vi.fn()
    const tree = (
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      paymentSource: any
    ) => (
      <Providers
        setPaymentSource={setPaymentSource}
        setPaymentMethodErrors={setPaymentMethodErrors}
        updateOrder={vi.fn()}
        paymentSource={paymentSource}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )

    const { rerender } = render(tree(PAYMENT_SOURCE))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      adyen.captured.options.onSubmit(
        { data: { paymentMethod: { type: "giftcard" } }, isValid: true },
        { mount: vi.fn() },
        actions
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // The shopper is told the session expired, not that their gift card is empty — the
    // balance check came back undefined because the request failed, not because it is zero.
    const [[errors]] = setPaymentMethodErrors.mock.calls
    expect(errors[0].message).toMatch(/session expired/i)

    // <PaymentGateway> creates the replacement: new id, and the payment methods payload
    // arrives with it.
    await act(async () => {
      rerender(tree({ ...PAYMENT_SOURCE, id: "ps-expired-replacement" }))
    })
    await flush()

    expect(adyen.dropinRemove).toHaveBeenCalled()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(2)
  })
})

// <PaymentGateway> recreates the adyen_payment whenever the order carries more than one
// payment method, and it can land after the Drop-in was built. The Drop-in installs its
// `onSubmit` once, so without a latest-value ref the submit authorizes against the source
// the order has already replaced: Adyen redeems the gift card against an orphan, the order
// comes back with `gift_card_amount_cents: 0`, and no amount is ever shown.
describe("AdyenPayment when the payment source is recreated mid-flight", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("submits against the current payment source, not the one it was built with", async () => {
    const setPaymentSource = vi.fn(async () => ({ ...PAYMENT_SOURCE, balance: 5000 }))
    const tree = (
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      paymentSource: any
    ) => (
      <Providers
        setPaymentSource={setPaymentSource}
        updateOrder={vi.fn().mockResolvedValue({ order: ORDER })}
        paymentSource={paymentSource}
      >
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )

    const { rerender } = render(tree(PAYMENT_SOURCE))
    await flush()
    expect(adyen.dropinMount).toHaveBeenCalledTimes(1)

    // The replacement arrives after the Drop-in is already mounted. It must not rebuild it
    // — that is the reload loop guarded elsewhere — but the next submit has to follow it.
    await act(async () => {
      rerender(tree({ ...PAYMENT_SOURCE, id: "ps-recreated" }))
    })
    await flush()
    expect(adyen.dropinRemove).not.toHaveBeenCalled()

    setPaymentSource.mockClear()
    await act(async () => {
      adyen.captured.options.onSubmit(
        { data: { paymentMethod: { type: "giftcard" } }, isValid: true },
        { mount: vi.fn() },
        { resolve: vi.fn(), reject: vi.fn() }
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    const ids = setPaymentSource.mock.calls.map(([args]) => args.paymentSourceId)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids)).toEqual(new Set(["ps-recreated"]))
  })
})

// A Drop-in method that needs no input — Klarna, PayPal — reports `isValid` the moment it is
// selected. `onSelect` used to answer that by writing `placeOrderButtonRef.current.disabled =
// false` straight onto the DOM node, which skips `isPermitted` entirely: the button went live
// with privacy & terms still unaccepted. React never repaired it either, because its own
// `disabled` prop had not changed — the fiber said `true` while the DOM said `false`.
// Selecting a method may only arm the submit wiring; enabling the button is the button's call.
describe("AdyenPayment does not enable the place-order button behind React's back", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
    adyen.captured.dropinOptions = null
  })

  it("leaves the button disabled when a no-input method reports itself valid on selection", async () => {
    // Stands in for the button `PlaceOrderButton` registers: React rendered it disabled
    // because the terms are unaccepted.
    const button = document.createElement("button")
    button.disabled = true
    const setPaymentRef = vi.fn()

    render(
      <Providers placeOrderButtonRef={{ current: button }} setPaymentRef={setPaymentRef}>
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )
    await flush()

    expect(adyen.captured.dropinOptions?.onSelect).toBeTypeOf("function")

    await act(async () => {
      adyen.captured.dropinOptions.onSelect({ _id: "klarna-0", isValid: true })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(button.disabled).toBe(true)
    // The supported channel is still used, so the button can enable itself once
    // `isPermitted` allows it.
    expect(setPaymentRef).toHaveBeenCalled()
  })

  it("leaves the button disabled when the Drop-in reports a valid change", async () => {
    const button = document.createElement("button")
    button.disabled = true
    const setPaymentRef = vi.fn()

    render(
      <Providers placeOrderButtonRef={{ current: button }} setPaymentRef={setPaymentRef}>
        <AdyenPayment clientKey="test_CLIENTKEY" />
      </Providers>
    )
    await flush()

    await act(async () => {
      adyen.captured.options.onChange({ isValid: true })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(button.disabled).toBe(true)
    expect(setPaymentRef).toHaveBeenCalled()
  })
})
