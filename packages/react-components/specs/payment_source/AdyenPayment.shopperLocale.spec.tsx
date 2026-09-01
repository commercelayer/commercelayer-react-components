// The Drop-in was translated correctly but the Klarna page it redirects to came up in Italian.
// `locale` in the Core configuration is client-side only — it picks the Drop-in's translation
// bundle and never reaches Adyen. The language Adyen uses for the hosted pages it renders
// itself comes from the shopper locale in the payment request — `shopper_locale` in Commerce
// Layer's attributes — which was not being sent.
import { act, render } from "@testing-library/react"
import { AdyenPayment } from "#components/payment_source/AdyenPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"

const adyen = vi.hoisted(() => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { options: null as any },
}))

vi.mock("@adyen/adyen-web/auto", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  AdyenCheckout: vi.fn(async (options: any) => {
    adyen.captured.options = options
    return { update: vi.fn() }
  }),
  Dropin: class FakeDropin {
    mount(): this {
      return this
    }
    submit(): void {}
    remove(): void {}
    unmount(): this {
      return this
    }
    handleAction(): void {}
  },
}))

vi.mock("#utils/getPublicIp", () => ({
  getPublicIP: vi.fn(async () => "127.0.0.1"),
}))

const PAYMENT_SOURCE = {
  id: "ps-1",
  type: "adyen_payments",
  payment_methods: {
    paymentMethods: [{ type: "scheme" }, { type: "klarna_account" }],
  },
}

/**
 * Mounts the component for an order in `languageCode`, submits a card, and returns the
 * `payment_request_data` that went to the API.
 */
async function submitAndCapturePaymentRequest({
  languageCode,
  shopperLocaleConfig,
}: {
  languageCode?: string
  shopperLocaleConfig?: string
  // biome-ignore lint/suspicious/noExplicitAny: test cast
}): Promise<{ paymentRequestData: any; dropInLocale: string }> {
  const setPaymentSource = vi.fn(async () => ({
    ...PAYMENT_SOURCE,
    payment_response: {},
  }))
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const order: any = {
    id: "order-1",
    status: "pending",
    payment_status: "unpaid",
    currency_code: "EUR",
    country_code: "IT",
    language_code: languageCode,
    total_amount_with_taxes_cents: 1000,
    line_items: [],
  }

  await act(async () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
        <OrderContext.Provider
          value={{
            ...defaultOrderContext,
            orderId: order.id,
            order,
            updateOrder: vi.fn(),
            getOrderByFields: vi.fn().mockResolvedValue({
              status: "pending",
              payment_status: "unpaid",
            }),
          }}
        >
          <CustomerContext.Provider value={{}}>
            <PlaceOrderContext.Provider value={defaultPlaceOrderContext}>
              <PaymentMethodContext.Provider
                value={
                  {
                    ...defaultPaymentMethodContext,
                    _isProvided: true as const,
                    paymentSource: PAYMENT_SOURCE,
                    currentPaymentMethodType: "scheme",
                    setPaymentSource,
                    setPaymentMethodErrors: vi.fn(),
                    setPaymentRef: vi.fn(),
                    errors: [],
                    // biome-ignore lint/suspicious/noExplicitAny: test cast
                  } as any
                }
              >
                <AdyenPayment
                  clientKey="test_CLIENTKEY"
                  config={shopperLocaleConfig ? { shopperLocale: shopperLocaleConfig } : {}}
                />
              </PaymentMethodContext.Provider>
            </PlaceOrderContext.Provider>
          </CustomerContext.Provider>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  await act(async () => {
    adyen.captured.options.onSubmit(
      { data: { paymentMethod: { type: "scheme" } }, isValid: true },
      { mount: vi.fn() },
      { resolve: vi.fn(), reject: vi.fn() }
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  const call = setPaymentSource.mock.calls
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    .map(([args]: any[]) => args)
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    .find((args: any) => args?.attributes?.payment_request_data != null)
  return {
    paymentRequestData: call?.attributes?.payment_request_data,
    dropInLocale: adyen.captured.options.locale,
  }
}

describe("AdyenPayment shopperLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adyen.captured.options = null
  })

  it("sends shopper_locale derived from the order language", async () => {
    const { paymentRequestData, dropInLocale } = await submitAndCapturePaymentRequest({
      languageCode: "en",
    })

    // The Drop-in keeps the bare language it always used — this is only about what Adyen gets.
    expect(dropInLocale).toBe("en")
    expect(paymentRequestData.shopper_locale).toBe("en-US")
  })

  it("does not take the language from the country code", async () => {
    // The bug: an English order in an Italian market rendered a Klarna page in Italian, because
    // nothing carried the language and Adyen fell back to the country.
    const { paymentRequestData } = await submitAndCapturePaymentRequest({
      languageCode: "en",
    })

    expect(paymentRequestData.shopper_locale).not.toContain("it")
  })

  it("lets the config override the derived value", async () => {
    const { paymentRequestData } = await submitAndCapturePaymentRequest({
      languageCode: "en",
      shopperLocaleConfig: "en-GB",
    })

    expect(paymentRequestData.shopper_locale).toBe("en-GB")
  })

  it("moves the Drop-in with it, so the two locales cannot disagree", async () => {
    const { paymentRequestData, dropInLocale } = await submitAndCapturePaymentRequest({
      languageCode: "en",
      shopperLocaleConfig: "it-IT",
    })

    // One locale for both surfaces. Without this an integration that sets the option would
    // get a Klarna page in Italian behind a Drop-in in English: the same mismatch as the
    // original bug, only chosen on purpose.
    expect(dropInLocale).toBe("it-IT")
    expect(paymentRequestData.shopper_locale).toBe("it-IT")
  })

  it("omits shopper_locale when the language cannot be expanded", async () => {
    const { paymentRequestData } = await submitAndCapturePaymentRequest({
      languageCode: "xx",
    })

    // Preserves Adyen's existing fallback rather than sending something it may reject.
    expect(paymentRequestData).not.toHaveProperty("shopper_locale")
  })

  it("falls back to the locale prop when the order has no language", async () => {
    const { paymentRequestData, dropInLocale } = await submitAndCapturePaymentRequest({
      languageCode: undefined,
    })

    // Same source the Drop-in falls back to, so the two stay consistent.
    expect(dropInLocale).toBe("en-US")
    expect(paymentRequestData.shopper_locale).toBe("en-US")
  })
})
