/**
 * Regression suite for placing the order when the shopper comes back from a
 * payment redirect (PayPal, Adyen 3DS/APM, Stripe 3DS).
 *
 * Every case here used to end with the order stranded at pending + authorized:
 * the payment went through, `_place` never fired, and nothing on the page said
 * so. The `NEVER placed` cases at the bottom are the guards that must survive
 * the fix — placing an order whose payment is not authorized is worse than not
 * placing it.
 */
import { render, waitFor } from "@testing-library/react"
import { type ReactNode, useRef, useState } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PlaceOrderButton } from "#components/orders/PlaceOrderButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"
import { setPlaceOrder as reducerSetPlaceOrder } from "#reducers/PlaceOrderReducer"

const ordersRetrieve = vi
  .fn()
  .mockResolvedValue({ id: "order-1", status: "pending", payment_status: "authorized" })

const ordersUpdate = vi.fn().mockResolvedValue({ id: "order-1", status: "placed" })

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({
      orders: {
        retrieve: (...args: unknown[]) => ordersRetrieve(...args),
        update: (...args: unknown[]) => ordersUpdate(...args),
      },
    }),
  }
})

vi.mock("#utils/organization", () => ({
  useOrganizationConfig: vi.fn().mockReturnValue(null),
}))

// The Stripe redirect effect verifies the payment intent before placing.
vi.mock("#utils/stripe/retrievePaymentIntent", () => ({
  checkPaymentIntent: vi.fn().mockResolvedValue({ status: "valid" }),
}))

// No card brand: Klarna / PayPal / APMs have none, so nothing else can flip
// `isValid` to true behind the scenes.
vi.mock("#utils/getCardDetails", () => ({
  default: vi.fn().mockReturnValue({ brand: "" }),
}))

// biome-ignore lint/suspicious/noExplicitAny: test cast
function makeOrder(paymentResponse: any, paymentSourceExtra: Record<string, unknown> = {}): any {
  return {
    id: "order-1",
    number: "1234",
    status: "pending",
    payment_status: "authorized",
    total_amount_with_taxes_cents: 1000,
    payment_method: { id: "pm-1", payment_source_type: "adyen_payments" },
    payment_source: {
      id: "ps-1",
      type: "adyen_payments",
      payment_response: paymentResponse,
      ...paymentSourceExtra,
    },
    billing_address: { id: "ba-1" },
    shipping_address: { id: "sa-1" },
    shipments: [],
    line_items: [],
  }
}

/** Payment source cloned from the customer wallet: details and an authorized response from an earlier order. */
const REDIRECT_DETAILS = {
  payment_request_details: { details: { redirectResult: "REDIRECT-RESULT" } },
}

function Harness({
  order,
  paymentType,
  options,
  setPlaceOrder,
  setPaymentSource,
  onsubmit,
  status = "standby",
  paymentSource = { id: "ps-1", type: "adyen_payments" },
  captureHandleClick,
  onClick,
  setOrder = vi.fn(),
}: {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  paymentType: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  options: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPlaceOrder: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentSource: any
  /** Pass a mock to simulate a mounted gateway widget that patched `onsubmit`. */
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  onsubmit?: any
  status?: "standby" | "placing" | "disabled"
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  paymentSource?: any
  /**
   * Hands the button's own `handleClick` back to the test, so a second caller
   * can be fired at it the way the gateway widget fires a programmatic click.
   */
  captureHandleClick?: (handleClick: () => Promise<void>) => void
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  onClick?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setOrder?: any
}): ReactNode {
  const formRef = useRef<HTMLFormElement | null>(null)
  if (onsubmit != null && formRef.current == null) {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    formRef.current = { onsubmit } as any
  }
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: "order-1",
          order,
          include: [],
          // biome-ignore lint/suspicious/noExplicitAny: test cast
          includeLoaded: {} as any,
          addResourceToInclude: vi.fn(),
          setOrder,
          setOrderErrors: vi.fn(),
          getOrder: vi.fn().mockResolvedValue(order),
          updateOrder: vi.fn().mockResolvedValue({ success: true }),
        }}
      >
        <CustomerContext.Provider value={{}}>
          <PaymentMethodContext.Provider
            value={{
              ...defaultPaymentMethodContext,
              _isProvided: true as const,
              loading: false,
              currentPaymentMethodType: paymentType,
              paymentSource,
              // biome-ignore lint/suspicious/noExplicitAny: test cast
              currentPaymentMethodRef: (onsubmit != null ? formRef : undefined) as any,
              setPaymentSource,
              setPaymentMethodErrors: vi.fn(),
              errors: [],
            }}
          >
            <PlaceOrderContext.Provider
              value={{
                ...defaultPlaceOrderContext,
                _isProvided: true as const,
                isPermitted: true,
                paymentType,
                options,
                status,
                paymentSource,
                setPlaceOrder,
                setPlaceOrderStatus: vi.fn(),
                setButtonRef: vi.fn(),
              }}
            >
              {captureHandleClick != null ? (
                <PlaceOrderButton onClick={onClick}>
                  {({ handleClick }) => {
                    captureHandleClick(handleClick)
                    return <button type="button">Place order</button>
                  }}
                </PlaceOrderButton>
              ) : (
                <PlaceOrderButton onClick={onClick} />
              )}
            </PlaceOrderContext.Provider>
          </PaymentMethodContext.Provider>
        </CustomerContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function placeOrderSpy(): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({ placed: true })
}

/** A mounted widget always reports failure when re-submitted after a redirect. */
function widgetOnsubmit(): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue(false)
}

async function settle(): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
}

const INCLUDE = ["payment_method", "payment_source", "line_items"]

/** The order as core returns it once it has placed it, with the includes the app reads. */
const PLACED_ORDER = {
  id: "order-1",
  number: "1234",
  status: "placed",
  payment_status: "authorized",
  payment_method: { id: "pm-1", payment_source_type: "adyen_payments" },
  payment_source: { id: "ps-1", type: "adyen_payments" },
  line_items: [{ id: "li-1" }],
}

/** The reducer's `setPlaceOrder`, wired the way `<PlaceOrderContainer>` wires it. */
function reducerPlaceOrder(
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order: any,
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setOrder: any,
  paymentType = "adyen_payments"
  // biome-ignore lint/suspicious/noExplicitAny: test cast
): any {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  return async (params: any) =>
    await reducerSetPlaceOrder({
      ...params,
      order,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      state: { options: {}, paymentType, errors: [], isPermitted: true } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      config: { accessToken: "test-token" } as any,
      include: INCLUDE,
      setOrder,
    })
}

/**
 * A harness whose order is real state: publishing the placed order re-renders the
 * button with it, the way `<OrderContainer>` does.
 */
// biome-ignore lint/suspicious/noExplicitAny: test cast
function StatefulAdyenReturn({ onClick }: { onClick: any }): ReactNode {
  const [order, setOrder] = useState(makeOrder(undefined))
  return (
    <Harness
      order={order}
      paymentType="adyen_payments"
      options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
      setPlaceOrder={reducerPlaceOrder(order, setOrder)}
      setPaymentSource={vi.fn().mockResolvedValue({
        id: "ps-1",
        payment_response: { resultCode: "Authorised" },
      })}
      onClick={onClick}
      setOrder={setOrder}
    />
  )
}

describe("place order on redirect return", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ordersRetrieve.mockResolvedValue({
      id: "order-1",
      status: "pending",
      payment_status: "authorized",
    })
  })

  it("PayPal return (PayerID in the url) places the order", async () => {
    const setPlaceOrder = placeOrderSpy()
    const order = makeOrder(undefined)
    order.payment_method.payment_source_type = "paypal_payments"
    order.payment_source.type = "paypal_payments"
    render(
      <Harness
        order={order}
        paymentType="paypal_payments"
        options={{ paypalPayerId: "PAYER-1" }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1", type: "paypal_payments" })}
        paymentSource={{ id: "ps-1", type: "paypal_payments" }}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  it.each(["Authorised", "Pending", "Received"])(
    "Adyen redirect returning %s places the order even with the widget re-armed",
    async (resultCode) => {
      const setPlaceOrder = placeOrderSpy()
      const onsubmit = widgetOnsubmit()
      render(
        <Harness
          order={makeOrder(undefined)}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={setPlaceOrder}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { resultCode },
          })}
          onsubmit={onsubmit}
        />
      )
      await waitFor(() => {
        expect(setPlaceOrder).toHaveBeenCalled()
      })
      // The shopper already paid on the redirect: submitting the widget again
      // would start a second payment attempt.
      expect(onsubmit).not.toHaveBeenCalled()
    }
  )

  it("re-entry on the return url (details already submitted) places the order", async () => {
    const setPlaceOrder = placeOrderSpy()
    render(
      <Harness
        order={makeOrder({ resultCode: "Authorised", merchantReference: "1234" }, REDIRECT_DETAILS)}
        paymentType="adyen_payments"
        options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { resultCode: "Authorised" },
        })}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  it("re-entry on a clean url places the order", async () => {
    const setPlaceOrder = placeOrderSpy()
    render(
      <Harness
        order={makeOrder({ resultCode: "Authorised", merchantReference: "1234" }, REDIRECT_DETAILS)}
        paymentType="adyen_payments"
        options={{}}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { resultCode: "Authorised" },
        })}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  it("a customized merchantReference does not stop the place when core says authorized", async () => {
    const setPlaceOrder = placeOrderSpy()
    render(
      <Harness
        order={makeOrder(
          { resultCode: "Authorised", merchantReference: "SHOP-REF-XYZ" },
          REDIRECT_DETAILS
        )}
        paymentType="adyen_payments"
        options={{}}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { resultCode: "Authorised" },
        })}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  it("only one automatic attempt per order", async () => {
    const setPlaceOrder = placeOrderSpy()
    render(
      <Harness
        order={makeOrder({ resultCode: "Authorised", merchantReference: "1234" }, REDIRECT_DETAILS)}
        paymentType="adyen_payments"
        options={{}}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { resultCode: "Authorised" },
        })}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
    await settle()
    expect(setPlaceOrder).toHaveBeenCalledTimes(1)
  })

  it("a click landing while the automatic attempt is in flight places the order once", async () => {
    const setPlaceOrder = placeOrderSpy()
    /**
     * The automatic effect and the programmatic click the gateway widget fires
     * after authorizing both reach `handleClick`, and both of its status checks
     * are async. Holding the status lookup open puts them in flight together,
     * which is the window that placed the order twice: two `_place` calls, and
     * with them two `_save_billing_address_to_customer_address_book` calls, so
     * the shopper ended up with the same address twice in their wallet.
     */
    let release: () => void = () => {}
    const lookup = new Promise<void>((resolve) => {
      release = resolve
    })
    ordersRetrieve.mockImplementation(async () => {
      await lookup
      return { id: "order-1", status: "pending", payment_status: "authorized" }
    })
    let handleClick: (() => Promise<void>) | null = null
    render(
      <Harness
        order={makeOrder({ resultCode: "Authorised", merchantReference: "1234" }, REDIRECT_DETAILS)}
        paymentType="adyen_payments"
        options={{}}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { resultCode: "Authorised" },
        })}
        captureHandleClick={(fn) => {
          handleClick = fn
        }}
      />
    )
    await waitFor(() => {
      expect(ordersRetrieve).toHaveBeenCalled()
    })
    // The widget clicks while the first attempt is still waiting on the lookup.
    const click = handleClick as unknown as () => Promise<void>
    const second = click()
    release()
    await second
    await settle()
    expect(setPlaceOrder).toHaveBeenCalledTimes(1)
  })

  it("Stripe 3DS return places the order before the context payment source hydrates", async () => {
    const setPlaceOrder = placeOrderSpy()
    const order = makeOrder(undefined)
    order.payment_method.payment_source_type = "stripe_payments"
    order.payment_source = { id: "ps-1", type: "stripe_payments", publishable_key: "pk_test" }
    render(
      <Harness
        order={order}
        paymentType="stripe_payments"
        options={{ stripe: { paymentIntentClientSecret: "pi_secret" } }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue(undefined)}
        paymentSource={null}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  it("Stripe 3DS return does not confirm the payment intent a second time", async () => {
    const setPlaceOrder = placeOrderSpy()
    const onsubmit = widgetOnsubmit()
    const order = makeOrder(undefined)
    order.payment_method.payment_source_type = "stripe_payments"
    order.payment_source = { id: "ps-1", type: "stripe_payments", publishable_key: "pk_test" }
    render(
      <Harness
        order={order}
        paymentType="stripe_payments"
        options={{ stripe: { paymentIntentClientSecret: "pi_secret" } }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1", type: "stripe_payments" })}
        paymentSource={{ id: "ps-1", type: "stripe_payments" }}
        onsubmit={onsubmit}
      />
    )
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
    expect(onsubmit).not.toHaveBeenCalled()
  })

  // The shopper came back without paying — they cancelled at the bank, or the cart changed
  // while they were away and Stripe voided the authorization. The return url still carries
  // the client secret, and every later click used to skip the widget and go straight to
  // `_place`, which the API refuses: the shopper could not pay again without reloading a
  // clean url.
  it("Stripe return with an unpaid intent lets the shopper pay again through the widget", async () => {
    const { checkPaymentIntent } = await import("#utils/stripe/retrievePaymentIntent")
    vi.mocked(checkPaymentIntent).mockResolvedValueOnce({
      status: "invalid",
      message: "The payment was not completed. Please try again.",
    })
    const setPlaceOrder = placeOrderSpy()
    const onsubmit = vi.fn().mockResolvedValue(true)
    const order = makeOrder(undefined)
    order.payment_method.payment_source_type = "stripe_payments"
    order.payment_source = { id: "ps-1", type: "stripe_payments", publishable_key: "pk_test" }
    const { getByRole } = render(
      <Harness
        order={order}
        paymentType="stripe_payments"
        options={{ stripe: { paymentIntentClientSecret: "pi_secret" } }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1", type: "stripe_payments" })}
        paymentSource={{ id: "ps-1", type: "stripe_payments" }}
        onsubmit={onsubmit}
      />
    )
    await waitFor(() => expect(checkPaymentIntent).toHaveBeenCalled())
    await settle()
    expect(setPlaceOrder).not.toHaveBeenCalled()

    getByRole("button").click()

    await waitFor(() => expect(onsubmit).toHaveBeenCalled())
    await waitFor(() => expect(setPlaceOrder).toHaveBeenCalled())
  })

  it("the normal flow still lets the widget validate the payment", async () => {
    const setPlaceOrder = placeOrderSpy()
    // Integrators pass empty strings when the shopper is not returning from a redirect.
    const onsubmit = vi.fn().mockResolvedValue(true)
    const { getByRole } = render(
      <Harness
        order={makeOrder(undefined)}
        paymentType="adyen_payments"
        options={{
          paypalPayerId: "",
          adyen: { redirectResult: "" },
          checkoutCom: { session_id: "" },
          stripe: { paymentIntentClientSecret: "" },
        }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1" })}
        onsubmit={onsubmit}
      />
    )
    getByRole("button").click()
    await waitFor(() => {
      expect(onsubmit).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  describe("address book flags (#904)", () => {
    const BILLING = "_save_billing_address_to_customer_address_book"
    const NORMAL_FLOW = {
      paypalPayerId: "",
      adyen: { redirectResult: "" },
      checkoutCom: { session_id: "" },
      stripe: { paymentIntentClientSecret: "" },
    }

    beforeEach(() => {
      localStorage.clear()
      ordersUpdate.mockResolvedValue({ id: "order-1", status: "pending" })
    })

    it("sends them before the widget submits, which may redirect to the gateway", async () => {
      // An `auto_place` method can have the order placed by the backend before the shopper
      // is back, and then nothing on the return attempts a place to send them.
      localStorage.setItem(BILLING, "true")
      const onsubmit = vi.fn().mockResolvedValue(true)
      const { getByRole } = render(
        <Harness
          order={makeOrder(undefined)}
          paymentType="adyen_payments"
          options={NORMAL_FLOW}
          setPlaceOrder={placeOrderSpy()}
          setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1" })}
          onsubmit={onsubmit}
        />
      )
      getByRole("button").click()
      await waitFor(() => expect(onsubmit).toHaveBeenCalled())

      expect(ordersUpdate).toHaveBeenCalledWith({ id: "order-1", [BILLING]: true })
      expect(ordersUpdate.mock.invocationCallOrder[0]).toBeLessThan(
        onsubmit.mock.invocationCallOrder[0] as number
      )
      // Cleared, so the return from the gateway does not send it a second time.
      expect(localStorage.getItem(BILLING)).toBe("false")
    })

    it("leaves them to the place path on the return from a redirect", async () => {
      localStorage.setItem(BILLING, "true")
      const setPlaceOrder = placeOrderSpy()
      render(
        <Harness
          order={makeOrder(undefined)}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={setPlaceOrder}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { resultCode: "Authorised" },
          })}
          onsubmit={widgetOnsubmit()}
        />
      )
      await waitFor(() => expect(setPlaceOrder).toHaveBeenCalled())

      expect(ordersUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ [BILLING]: true }))
      expect(localStorage.getItem(BILLING)).toBe("true")
    })
  })

  it("Checkout.com still places an order whose payment was declined", async () => {
    const setPlaceOrder = placeOrderSpy()
    const order = makeOrder({ status: "Declined" })
    order.payment_method.payment_source_type = "checkout_com_payments"
    order.payment_status = "unpaid"
    const { getByRole } = render(
      <Harness
        order={order}
        paymentType="checkout_com_payments"
        options={{ checkoutCom: { session_id: "cko-session-1" } }}
        setPlaceOrder={setPlaceOrder}
        setPaymentSource={vi.fn().mockResolvedValue({
          id: "ps-1",
          payment_response: { status: "Declined" },
        })}
        onsubmit={vi.fn().mockResolvedValue(true)}
      />
    )
    getByRole("button").click()
    await waitFor(() => {
      expect(setPlaceOrder).toHaveBeenCalled()
    })
  })

  // #929: core can place the order on authorization, between the `_details` response and
  // the button's own status check. The button then reported `placed: true` with the order
  // from context, still `pending`, and never published the placed one, so the app stayed on
  // the checkout with the order placed on the server.
  describe("an order core placed before the button could (#929)", () => {
    it("Adyen redirect return hands onClick the placed order and publishes it", async () => {
      const order = makeOrder(undefined)
      const setOrder = vi.fn()
      const onClick = vi.fn()
      ordersRetrieve.mockResolvedValue(PLACED_ORDER)
      render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={reducerPlaceOrder(order, setOrder)}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { resultCode: "Authorised" },
          })}
          onClick={onClick}
          setOrder={setOrder}
        />
      )
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled()
      })
      await settle()
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith({ placed: true, order: PLACED_ORDER })
      // Read with the includes the app builds the thank-you page from, and published.
      expect(ordersRetrieve).toHaveBeenCalledWith("order-1", { include: INCLUDE })
      expect(setOrder).toHaveBeenCalledWith(PLACED_ORDER)
      expect(ordersUpdate).not.toHaveBeenCalled()
    })

    it("a click on a method with no redirect gets the placed order too", async () => {
      const order = makeOrder(undefined)
      order.payment_method.payment_source_type = "wire_transfers"
      order.payment_source.type = "wire_transfers"
      const setOrder = vi.fn()
      const onClick = vi.fn()
      let handleClick: (() => Promise<void>) | undefined
      render(
        <Harness
          order={order}
          paymentType="wire_transfers"
          options={{}}
          setPlaceOrder={reducerPlaceOrder(order, setOrder, "wire_transfers")}
          setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1", type: "wire_transfers" })}
          paymentSource={{ id: "ps-1", type: "wire_transfers" }}
          onClick={onClick}
          setOrder={setOrder}
          captureHandleClick={(fn) => {
            handleClick = fn
          }}
        />
      )
      await settle()
      expect(onClick).not.toHaveBeenCalled()
      ordersRetrieve.mockResolvedValue(PLACED_ORDER)
      await handleClick?.()
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith({ placed: true, order: PLACED_ORDER })
      expect(setOrder).toHaveBeenCalledWith(PLACED_ORDER)
      expect(ordersUpdate).not.toHaveBeenCalled()
    })

    it("still reports it placed, with the order it has, when it cannot be read again", async () => {
      const order = makeOrder(undefined)
      const onClick = vi.fn()
      ordersRetrieve.mockResolvedValue(PLACED_ORDER)
      render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={vi.fn().mockResolvedValue({ placed: false, errors: [] })}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { resultCode: "Authorised" },
          })}
          onClick={onClick}
        />
      )
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled()
      })
      expect(onClick).toHaveBeenCalledWith({ placed: true, order })
    })

    it("reports it once when the published order re-renders the button", async () => {
      const onClick = vi.fn()
      ordersRetrieve.mockResolvedValue(PLACED_ORDER)
      render(<StatefulAdyenReturn onClick={onClick} />)
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled()
      })
      await settle()
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenLastCalledWith({ placed: true, order: PLACED_ORDER })
    })
  })

  describe("guards that must keep the order unplaced", () => {
    it("an authorized response from an earlier order (cloned wallet source) is NEVER placed", async () => {
      const setPlaceOrder = placeOrderSpy()
      // merchantReference points at another order and core has not authorized this one.
      const order = makeOrder(
        { resultCode: "Authorised", merchantReference: "9999" },
        REDIRECT_DETAILS
      )
      order.payment_status = "unpaid"
      render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{}}
          setPlaceOrder={setPlaceOrder}
          setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1" })}
        />
      )
      await settle()
      expect(setPlaceOrder).not.toHaveBeenCalled()
    })

    it("a refused redirect is NEVER placed, even on a manual click", async () => {
      const setPlaceOrder = placeOrderSpy()
      const order = makeOrder({ resultCode: "Refused" })
      order.payment_status = "unpaid"
      const { getByRole } = render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={setPlaceOrder}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { resultCode: "Refused" },
          })}
          onsubmit={vi.fn().mockResolvedValue(true)}
        />
      )
      getByRole("button").click()
      await settle()
      // The button was live and the click did reach handleClick: only the veto
      // stopped it, not a disabled button.
      expect(getByRole("button").hasAttribute("disabled")).toBe(false)
      expect(ordersRetrieve).toHaveBeenCalled()
      expect(setPlaceOrder).not.toHaveBeenCalled()
    })

    it("a declined payment response is NEVER placed on a redirect return", async () => {
      const setPlaceOrder = placeOrderSpy()
      const order = makeOrder({ status: "Declined" })
      order.payment_status = "unpaid"
      const { getByRole } = render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{ adyen: { redirectResult: "REDIRECT-RESULT" } }}
          setPlaceOrder={setPlaceOrder}
          setPaymentSource={vi.fn().mockResolvedValue({
            id: "ps-1",
            payment_response: { status: "Declined" },
          })}
          onsubmit={vi.fn().mockResolvedValue(true)}
        />
      )
      getByRole("button").click()
      await settle()
      // The button was live and the click did reach handleClick: only the veto
      // stopped it, not a disabled button.
      expect(getByRole("button").hasAttribute("disabled")).toBe(false)
      expect(ordersRetrieve).toHaveBeenCalled()
      expect(setPlaceOrder).not.toHaveBeenCalled()
    })

    it("a placed order is not placed again", async () => {
      // The real `setPlaceOrder`: the button hands an already-placed order to it (#929),
      // and it is its pre-check that keeps `_place` from being sent.
      const order = makeOrder(
        { resultCode: "Authorised", merchantReference: "1234" },
        REDIRECT_DETAILS
      )
      ordersRetrieve.mockResolvedValue(PLACED_ORDER)
      render(
        <Harness
          order={order}
          paymentType="adyen_payments"
          options={{}}
          setPlaceOrder={reducerPlaceOrder(order, vi.fn())}
          setPaymentSource={vi.fn().mockResolvedValue({ id: "ps-1" })}
        />
      )
      await settle()
      expect(ordersRetrieve).toHaveBeenCalled()
      expect(ordersUpdate).not.toHaveBeenCalled()
    })
  })
})
