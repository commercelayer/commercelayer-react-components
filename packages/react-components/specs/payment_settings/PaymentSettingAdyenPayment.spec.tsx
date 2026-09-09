import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingAdyenPayment } from "#components/payment_settings/PaymentSettingAdyenPayment"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import type { BaseError } from "#typings/errors"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

const adyen = vi.hoisted(() => ({
  dropinMount: vi.fn(),
  dropinRemove: vi.fn(),
  dropinSubmit: vi.fn(),
  isValid: true,
  // The Core and Drop-in configuration the component builds, so tests can
  // invoke the very callbacks it installed.
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { options: null as any, dropinOptions: null as any },
}))

vi.mock("@adyen/adyen-web/auto", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  AdyenCheckout: vi.fn(async (options: any) => {
    adyen.captured.options = options
    return { submitDetails: vi.fn(), remove: vi.fn() }
  }),
  Dropin: class FakeDropin {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    constructor(_core: any, options: any) {
      adyen.captured.dropinOptions = options
    }
    get isValid(): boolean {
      return adyen.isValid
    }
    mount(node: unknown): this {
      adyen.dropinMount(node)
      return this
    }
    submit(): void {
      adyen.dropinSubmit()
    }
    remove(): void {
      adyen.dropinRemove()
    }
  },
}))

const { authorizeGiftCardsMock, createPaymentSessionMock, discardPaymentSessionMock } = vi.hoisted(
  () => ({
    authorizeGiftCardsMock: vi.fn(),
    createPaymentSessionMock: vi.fn(),
    discardPaymentSessionMock: vi.fn(),
  })
)

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizeGiftCardSessions: authorizeGiftCardsMock,
    createPaymentSession: createPaymentSessionMock,
    discardPaymentSession: discardPaymentSessionMock,
  }
})

/** The privacy-and-terms gate, which PayPal's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

// `paymentSettingCreateAttributes` decides the tokenization variant from the
// token, and the test token is not a real JWT.
vi.mock("#utils/isGuestToken", () => ({ isGuestToken: () => true }))

// Cast where the fixture is defined, as the core specs do, rather than at
// every call site: `available_payment_settings` is the six-member per-provider
// union, and a literal without `created_at`/`updated_at` matches none of them.
const ADYEN_SETTING = {
  id: "ps-adyen",
  type: "payment_setting_adyens",
  name: "Adyen",
  public_key: "test_ABC123",
} as unknown as PaymentSettingResource

const ADYEN_SESSION = {
  id: "session-adyen",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 7100,
  payment_setting: { id: "ps-adyen", type: "payment_setting_adyens" },
  response_data: { id: "CS-1", sessionData: "blob-1" },
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [ADYEN_SETTING],
    payment_sessions: [ADYEN_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

/** The host collection this component is expected to have registered. */
function hostCollection() {
  const { collection } = getHandoffSnapshot("order-1")
  if (collection?.by !== "host") {
    throw new Error(`expected a host collection, got ${JSON.stringify(collection)}`)
  }
  return collection
}

function hostSubmit() {
  return hostCollection().submit
}

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
            addResourceToInclude: vi.fn(),
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

/** The tree under test, as an element, so `rerender` can re-render it. */
function tree(currentOrder: Partial<Order> | null = order()) {
  return (
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingAdyenPayment containerClassName="dropin" />
      </PaymentSetting>
    </Wrapper>
  )
}

function renderAdyen(currentOrder: Partial<Order> | null = order()) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingAdyenPayment containerClassName="dropin" />
      </PaymentSetting>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  adyen.isValid = true
  adyen.captured.options = null
  adyen.captured.dropinOptions = null
  permitted.value = true
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  createPaymentSessionMock.mockResolvedValue({ id: "session-new" })
  discardPaymentSessionMock.mockResolvedValue(true)
  getOrder.mockResolvedValue(order())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("<PaymentSettingAdyenPayment> mounting", () => {
  it("builds the Drop-in from the Adyen Session on the order", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })
    expect(adyen.captured.options.session).toEqual({ id: "CS-1", sessionData: "blob-1" })
    expect(adyen.captured.options.clientKey).toBe("test_ABC123")
  })

  it("suppresses Adyen's own Pay button, on the Core and not on the Drop-in", async () => {
    // The Drop-in forwards only `{ elementRef, isDropin }` to its children, so
    // setting it on the Drop-in would visibly do nothing.
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.showPayButton).toBe(false)
    expect(adyen.captured.dropinOptions.showPayButton).toBeUndefined()
  })

  it("offers every designed method, and only those", async () => {
    // Restricting matters because `showPayButton: false` deletes a wallet's
    // component rather than hiding its button, so an undesigned method would
    // render an accordion that opens on nothing.
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.allowPaymentMethods).toEqual(["scheme", "paypal", "googlepay"])
  })

  it("leaves Apple Pay out until it is asked for", async () => {
    // The one method whose being offered is not evidence it can work: its
    // button renders wherever the device can pay, and a domain that is not
    // registered for Apple Pay fails later, at merchant validation, after the
    // shopper has tapped. Nothing here can detect that, so it is opt-in.
    renderAdyen()
    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.allowPaymentMethods).not.toContain("applepay")
    expect(adyen.captured.dropinOptions.paymentMethodsConfiguration.applepay).toBeUndefined()
  })

  it("lets an application narrow the list", async () => {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment paymentMethods={["card"]} containerClassName="dropin" />
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.allowPaymentMethods).toEqual(["scheme"])
    // And nothing is configured for a method that is not on offer: the cards
    // are the one method the host's own button collects, so a configuration
    // here would mean a wallet had been wired up invisibly.
    expect(adyen.captured.dropinOptions.paymentMethodsConfiguration).toBeUndefined()
  })

  it("drops a method it has not been designed for, with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment
            paymentMethods={["card", "applepay" as never]}
            containerClassName="dropin"
          />
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.allowPaymentMethods).toEqual(["scheme"])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("applepay"))
  })

  it("disables the final animation, since a refusal replaces the session", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.dropinOptions).not.toBeNull()
    })
    expect(adyen.captured.dropinOptions.disableFinalAnimation).toBe(true)
  })

  it("derives the environment from the Client Key prefix", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.environment).toBe("test")
  })

  it("still renders its container when a function child is given", async () => {
    // The Drop-in mounts into that element. If a render prop replaced it — as
    // it does elsewhere in the library — an application that forgot to render
    // the container would get a payment form that silently never appears.
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingAdyenPayment containerClassName="dropin">
            {({ isSubmitting }) => (
              <span data-testid="chrome">{isSubmitting ? "paying" : "idle"}</span>
            )}
          </PaymentSettingAdyenPayment>
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByTestId("chrome").textContent).toBe("idle")
  })

  it("does not mount without an Adyen Session on the order", async () => {
    // What a `fields` allowlist that omits `response_data` produces.
    renderAdyen(order({ payment_sessions: [{ ...ADYEN_SESSION, response_data: null }] }))

    await waitFor(() => {
      expect(screen.getByTestId("radio")).toBeTruthy()
    })
    expect(adyen.dropinMount).not.toHaveBeenCalled()
  })
})

describe("<PaymentSetting> skipping unusable Adyen settings", () => {
  it("skips a setting with no public_key", async () => {
    // Optional and unvalidated server-side, so a setting that charges fine
    // server-side can carry none — and then the Drop-in cannot boot. A radio
    // button that does nothing is worse than no radio button.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    renderAdyen(order({ available_payment_settings: [{ ...ADYEN_SETTING, public_key: null }] }))

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no public_key"))
    })
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  it("skips a disabled setting", async () => {
    // `available_payment_settings` has no `.enabled` filter, unlike the older
    // model's `available_payment_methods`.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    renderAdyen(
      order({
        available_payment_settings: [{ ...ADYEN_SETTING, disabled_at: "2026-09-01T00:00:00Z" }],
      })
    )

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("is disabled"))
    })
    expect(screen.queryByTestId("radio")).toBeNull()
  })
})

describe("the Payment Gateway Handoff", () => {
  it("registers a submit the place-order button can call", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")
    })
  })

  it("resolves as completed when Adyen reports the payment taken", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = hostSubmit()
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      // The Drop-in charges the card and answers through the callback the
      // component installed, not through the return value of `submit()`.
      adyen.captured.options.onPaymentCompleted({ resultCode: "Authorised" })
      await pending
    })

    expect(adyen.dropinSubmit).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ status: "completed" })
  })

  it("reports an invalid form as incomplete without submitting a payment", async () => {
    // `dropin.submit()` shows its own validation and no-ops, settling nothing,
    // so the guard is what stops the caller waiting forever.
    adyen.isValid = false
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = hostSubmit()
    const result = await act(async () => await submit?.())

    expect(result).toEqual({ status: "incomplete" })
    expect(adyen.dropinSubmit).toHaveBeenCalledTimes(1)
  })

  it("carries Adyen's resultCode as the failure code, with no copy of its own", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = hostSubmit()
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
      await pending
    })

    expect(result).toEqual({ status: "failed", code: "Refused" })
  })

  it("reports a network or SDK error as unknown, so nothing is rolled back", async () => {
    // The payment may have gone through: refunding gift cards here could take
    // back money for a card that did charge.
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = hostSubmit()
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      adyen.captured.options.onError({ name: "NETWORK_ERROR", message: "boom" })
      await pending
    })

    expect(result).toEqual({ status: "unknown", code: "NETWORK_ERROR" })
  })

  it("publishes readiness from the Drop-in's own validity", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })

    await act(async () => {
      adyen.captured.options.onChange({ isValid: true })
    })
    expect(hostCollection().isReady).toBe(true)

    await act(async () => {
      adyen.captured.options.onChange({ isValid: false })
    })
    expect(hostCollection().isReady).toBe(false)
  })
})

describe("who may claim to collect a payment", () => {
  const MANUAL = {
    id: "ps-manual",
    type: "payment_setting_manuals",
    name: "Wire Transfer",
  } as unknown as PaymentSettingResource

  const MANUAL_SESSION = {
    id: "session-manual",
    type: "payment_sessions",
    status: "unpaid",
    amount_cents: 7100,
    payment_setting: { id: "ps-manual", type: "payment_setting_manuals" },
  } as unknown as PaymentSession

  /**
   * `<PaymentSetting>` renders its children once per available setting, so this
   * component is mounted inside every setting's card and returns `null` from
   * all but one — while its effects still run.
   *
   * Registering a handoff from those instances told `<PlaceOrderButton>` that a
   * gateway would collect the payment on an order paying by bank transfer. It
   * called `submit()`, got `incomplete` back from an instance that has no
   * Drop-in, and returned without placing anything, in silence. An end-to-end
   * test that had passed for weeks caught it; nothing here did.
   */
  it("does not register while another setting is the one selected", async () => {
    renderAdyen(
      order({
        available_payment_settings: [MANUAL, ADYEN_SETTING],
        payment_sessions: [MANUAL_SESSION],
      })
    )

    await waitFor(() => {
      expect(screen.getAllByTestId("radio").length).toBeGreaterThan(0)
    })
    expect(getHandoffSnapshot("order-1").collection).toBeNull()
    expect(adyen.dropinMount).not.toHaveBeenCalled()
  })

  it("gives the handoff up when the shopper switches away", async () => {
    const { rerender } = renderAdyen(order({ available_payment_settings: [MANUAL, ADYEN_SETTING] }))
    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")
    })

    rerender(
      <Wrapper
        currentOrder={order({
          available_payment_settings: [MANUAL, ADYEN_SETTING],
          payment_sessions: [MANUAL_SESSION],
        })}
      >
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin" />
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collection).toBeNull()
    })
  })
})

describe("what this component does NOT do on a refusal", () => {
  it("leaves replacing the burnt Payment Session to the place-order button", async () => {
    // Not an oversight. The button also decides whether the gift cards are
    // given back, and that changes what is left to pay — so a replacement
    // created here would be sized for the wrong amount.
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
    expect(createPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("remounts a fresh Drop-in once the session is replaced", async () => {
    // The error screen tears down the PCI secured-field iframes, so a new
    // Adyen Session is the only route back to a usable form.
    const { rerender } = renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })

    const replaced = order({
      payment_sessions: [
        {
          ...ADYEN_SESSION,
          id: "session-adyen-2",
          response_data: { id: "CS-2", sessionData: "blob-2" },
        },
      ],
    })
    rerender(
      <Wrapper currentOrder={replaced}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin" />
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(2)
    })
    expect(adyen.dropinRemove).toHaveBeenCalled()
    expect(adyen.captured.options.session).toEqual({ id: "CS-2", sessionData: "blob-2" })
  })
})

describe("PayPal, which owns its own click", () => {
  /** Tell the component which method the shopper has open, as the Drop-in does. */
  async function select(type: string): Promise<void> {
    await act(async () => {
      adyen.captured.dropinOptions.onSelect({ type })
    })
  }

  function payPalConfig() {
    const config = adyen.captured.dropinOptions.paymentMethodsConfiguration?.paypal
    if (config == null) throw new Error("PayPal was not configured on the Drop-in")
    return config
  }

  async function mounted(): Promise<void> {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })
  }

  it("re-enables its own button, which the Core had switched off", async () => {
    // Left false, PayPal's component returns `null` outright — the shopper gets
    // an accordion that opens on nothing rather than a hidden button.
    await mounted()
    expect(payPalConfig().showPayButton).toBe(true)
    expect(adyen.captured.options.showPayButton).toBe(false)
  })

  it("hands the place-order button a collection it cannot call", async () => {
    // `submit` on PayPal throws by design, so the button is told who collects
    // rather than being given a route that ends in IMPLEMENTATION_ERROR.
    await mounted()
    expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")

    await select("paypal")
    expect(getHandoffSnapshot("order-1").collection).toEqual({ by: "gateway" })
  })

  it("hands it back when the shopper returns to the card", async () => {
    await mounted()
    await select("paypal")
    await select("scheme")
    expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")
  })

  it("refuses the click when the terms have not been accepted", async () => {
    // The gate, at the last moment before anything happens: `actions.reject()`
    // aborts before the popup opens and before any Adyen call.
    permitted.value = false
    await mounted()

    const actions = { resolve: vi.fn(async () => {}), reject: vi.fn(async () => {}) }
    await act(async () => {
      await payPalConfig().onClick({}, actions)
    })

    expect(actions.reject).toHaveBeenCalled()
    expect(actions.resolve).not.toHaveBeenCalled()
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
  })

  it("says why it refused, because a dead button reads as a broken one", async () => {
    // The click is PayPal's, so this is the only place the reason can be
    // produced. `meta.error` is what an application keys its copy off; the
    // message is a default for one that renders `errors` as they come.
    permitted.value = false
    let reported: BaseError[] = []
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin">
            {({ errors: adyenErrors }) => {
              reported = adyenErrors
              return <></>
            }}
          </PaymentSettingAdyenPayment>
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(adyen.captured.dropinOptions).not.toBeNull()
    })

    const actions = { resolve: vi.fn(async () => {}), reject: vi.fn(async () => {}) }
    await act(async () => {
      await adyen.captured.dropinOptions.paymentMethodsConfiguration.paypal.onClick({}, actions)
    })

    expect(actions.reject).toHaveBeenCalled()
    expect(reported[0]?.meta).toEqual({ error: "TermsNotAccepted" })
  })

  it("renders its buttons disabled until the terms are accepted", async () => {
    permitted.value = false
    await mounted()

    const initActions = { enable: vi.fn(async () => {}), disable: vi.fn(async () => {}) }
    await act(async () => {
      payPalConfig().onInit({}, initActions)
    })
    expect(initActions.disable).toHaveBeenCalled()
  })

  it("wakes every funding source's button when the terms are accepted after they render", async () => {
    // Adyen renders four separate `paypal.Buttons()` instances — PayPal,
    // Credit, Pay Later, Venmo — each with its own `onInit`, and
    // `actions.enable()` reaches only the instance it came from. Keeping the
    // last one handed over left a real shopper with a working Venmo button
    // while PayPal and Pay Later swallowed the click, and no e2e saw it because
    // the tests accept the terms *before* the buttons render.
    permitted.value = false
    const { rerender } = render(tree())
    await waitFor(() => {
      expect(adyen.captured.dropinOptions).not.toBeNull()
    })

    const fundingSources = ["paypal", "credit", "paylater", "venmo"].map(() => ({
      enable: vi.fn(async () => {}),
      disable: vi.fn(async () => {}),
    }))
    await act(async () => {
      for (const actions of fundingSources) payPalConfig().onInit({}, actions)
    })
    for (const actions of fundingSources) {
      expect(actions.disable).toHaveBeenCalled()
    }

    permitted.value = true
    await act(async () => {
      rerender(tree())
    })

    for (const [index, actions] of fundingSources.entries()) {
      expect(actions.enable, `funding source ${index} was left disabled`).toHaveBeenCalled()
    }
  })

  it("charges the gift cards on the click, before the popup opens", async () => {
    // The only moment we are given: PayPal's button performs the payment, and
    // `beforeSubmit` runs after the popup is already open — and hangs it.
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    await mounted()

    const actions = { resolve: vi.fn(async () => {}), reject: vi.fn(async () => {}) }
    await act(async () => {
      await payPalConfig().onClick({}, actions)
    })

    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(1)
    // Refetched, so the place sequence skips the cards it would otherwise
    // authorize a second time.
    expect(getOrder).toHaveBeenCalledWith("order-1")
    expect(actions.resolve).toHaveBeenCalled()
  })

  it("does not open the popup when a gift card cannot be charged", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()

    const actions = { resolve: vi.fn(async () => {}), reject: vi.fn(async () => {}) }
    await act(async () => {
      await payPalConfig().onClick({}, actions)
    })

    expect(actions.reject).toHaveBeenCalled()
    expect(actions.resolve).not.toHaveBeenCalled()
  })

  it("reports its completion as an out-of-band collection", async () => {
    // Nobody pressed our button, so there is no promise to settle: the place
    // button watches this and takes the order the rest of the way.
    await mounted()
    await select("paypal")

    await act(async () => {
      adyen.captured.options.onPaymentCompleted({ resultCode: "Authorised" })
    })

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
  })

  it("reports a completion that is not captured funds, and still places", async () => {
    // `Pending` and `Received` arrive as success — PayPal produces them far
    // more than cards do — so the code is surfaced rather than assumed.
    let seen: string | undefined
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin">
            {({ lastResultCode }) => {
              seen = lastResultCode
              return <></>
            }}
          </PaymentSettingAdyenPayment>
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })
    await select("paypal")

    await act(async () => {
      adyen.captured.options.onPaymentCompleted({ resultCode: "Pending" })
    })

    expect(seen).toBe("Pending")
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
  })

  it("reports a refusal as an out-of-band failure", async () => {
    await mounted()
    await select("paypal")

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    const snapshot = getHandoffSnapshot("order-1")
    expect(snapshot.collectedOutOfBand).toBe("failed")
    expect(snapshot.errors[0]?.meta).toEqual({ error: "Refused" })
  })

  it("touches nothing when the shopper closes the overlay", async () => {
    // A closed overlay arrives on `onError`, and every `onError` is an unknown
    // outcome: the Adyen Session stays, and the shopper can click again.
    await mounted()
    await select("paypal")

    await act(async () => {
      adyen.captured.options.onError({ name: "CANCEL", message: "" })
    })

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })
})

describe("Google Pay, whose click cannot wait", () => {
  async function mounted(): Promise<void> {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })
  }

  function googlePayConfig() {
    const config = adyen.captured.dropinOptions.paymentMethodsConfiguration?.googlepay
    if (config == null) throw new Error("Google Pay was not configured on the Drop-in")
    return config
  }

  /** Tell the component the shopper has Google Pay open, as the Drop-in does. */
  async function selectGooglePay(): Promise<void> {
    await act(async () => {
      adyen.captured.dropinOptions.onSelect({ type: "googlepay" })
    })
  }

  it("re-enables its own button, which the Core had switched off", async () => {
    await mounted()
    expect(googlePayConfig().showPayButton).toBe(true)
  })

  it("takes collection, because the gesture cannot survive our round trip", async () => {
    // `submit` works on Google Pay, unlike PayPal — and it is still no use:
    // `loadPaymentData()` runs after our gift cards and Google requires it
    // inside the click's gesture.
    await mounted()
    await selectGooglePay()
    expect(getHandoffSnapshot("order-1").collection).toEqual({ by: "gateway" })
  })

  it("refuses the click synchronously when the terms are not accepted", async () => {
    // Synchronously is the whole point: anything awaited here happens between
    // the shopper's gesture and the sheet. Google's button has no disabled
    // state either, so the message is all the shopper gets.
    permitted.value = false
    let reported: BaseError[] = []
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin">
            {({ errors: adyenErrors }) => {
              reported = adyenErrors
              return <></>
            }}
          </PaymentSettingAdyenPayment>
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(adyen.captured.dropinOptions).not.toBeNull()
    })

    const resolve = vi.fn()
    const reject = vi.fn()
    await act(async () => {
      googlePayConfig().onClick(resolve, reject)
    })

    expect(reject).toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
    expect(reported[0]?.meta).toEqual({ error: "TermsNotAccepted" })
    // Not even asked for: the gift cards are not this hook's business.
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
  })

  it("resolves the click without touching the network", async () => {
    await mounted()

    const resolve = vi.fn()
    const reject = vi.fn()
    await act(async () => {
      googlePayConfig().onClick(resolve, reject)
    })

    expect(resolve).toHaveBeenCalled()
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
    expect(getOrder).not.toHaveBeenCalled()
  })

  it("charges the gift cards on the authorization, before the payment call", async () => {
    // The moment after the sheet and before the money: Adyen calls `/payments`
    // only once this resolves.
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    await mounted()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      googlePayConfig().onAuthorized({}, actions)
    })

    await waitFor(() => {
      expect(actions.resolve).toHaveBeenCalled()
    })
    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(1)
    // Refetched, so the place sequence skips what has already been charged.
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("hands Google the reason a gift card could not be charged", async () => {
    // A string reaches Google's own sheet verbatim, and the sheet stays open —
    // so the shopper can try another card instead of losing the wallet flow.
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      googlePayConfig().onAuthorized({}, actions)
    })

    await waitFor(() => {
      expect(actions.reject).toHaveBeenCalledWith("Gift card balance is insufficient.")
    })
    expect(actions.resolve).not.toHaveBeenCalled()
  })

  it("does not burn the Adyen Session when the abort was its own", async () => {
    // Adyen routes a rejected `onAuthorized` through the same `onPaymentFailed`
    // a refusal arrives on. Read as a refusal it would discard the Payment
    // Session — and the session *is* the payment, so the retry Google is
    // offering inside its still-open sheet would have nothing to pay with.
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()
    await selectGooglePay()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      googlePayConfig().onAuthorized({}, actions)
    })
    await waitFor(() => {
      expect(actions.reject).toHaveBeenCalled()
    })

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    const snapshot = getHandoffSnapshot("order-1")
    expect(snapshot.collectedOutOfBand).toBe("no")
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("still reports a real refusal on the next attempt", async () => {
    // The flag is consumed, so it cannot swallow the refusal that follows it.
    await mounted()
    await selectGooglePay()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      googlePayConfig().onAuthorized({}, actions)
    })
    await waitFor(() => {
      expect(actions.resolve).toHaveBeenCalled()
    })

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("failed")
  })
})

describe("Apple Pay, which is Google Pay's shape", () => {
  /**
   * Apple's error type, which only Safari defines.
   *
   * Stood up here because it is the one thing the two wallets do not share:
   * Adyen types Apple Pay's `reject` for an `ApplePayError` and nothing else,
   * so a bare string — which is exactly what Google Pay wants — is silently
   * replaced by Apple's own generic wording.
   */
  class FakeApplePayError {
    constructor(
      readonly code: string,
      readonly contactField: string | undefined,
      readonly message: string | undefined
    ) {}
  }

  beforeEach(() => {
    ;(globalThis as { ApplePayError?: unknown }).ApplePayError = FakeApplePayError
  })

  afterEach(() => {
    delete (globalThis as { ApplePayError?: unknown }).ApplePayError
  })

  /** Apple Pay is opt-in, so every test here asks for it. */
  async function mounted(): Promise<void> {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment
            paymentMethods={["card", "paypal", "google_pay", "apple_pay"]}
            containerClassName="dropin"
          />
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })
  }

  function applePayConfig() {
    const config = adyen.captured.dropinOptions.paymentMethodsConfiguration?.applepay
    if (config == null) throw new Error("Apple Pay was not configured on the Drop-in")
    return config
  }

  it("is configured exactly as Google Pay is", async () => {
    // The assertion is the sameness. Both wallets re-enable their own button,
    // take a positional `onClick` whose resolution opens their sheet inside the
    // gesture, and run `onAuthorized` before `/payments` — so they are built by
    // one function called twice, and this says so.
    await mounted()
    const googlePay = adyen.captured.dropinOptions.paymentMethodsConfiguration.googlepay

    expect(applePayConfig().showPayButton).toBe(true)
    expect(Object.keys(applePayConfig()).sort()).toEqual(Object.keys(googlePay).sort())
  })

  it("takes collection when the shopper opens it", async () => {
    await mounted()
    await act(async () => {
      adyen.captured.dropinOptions.onSelect({ type: "applepay" })
    })
    expect(getHandoffSnapshot("order-1").collection).toEqual({ by: "gateway" })
  })

  it("refuses the click before the sheet, when the terms are not accepted", async () => {
    permitted.value = false
    await mounted()

    const resolve = vi.fn()
    const reject = vi.fn()
    await act(async () => {
      applePayConfig().onClick(resolve, reject)
    })

    expect(reject).toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
    // `session.begin()` waits on this, and Safari wants it inside the gesture.
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
  })

  it("charges the gift cards on the authorization", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    await mounted()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      applePayConfig().onAuthorized({}, actions)
    })

    await waitFor(() => {
      expect(actions.resolve).toHaveBeenCalled()
    })
    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(1)
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("dresses a refusal as an ApplePayError, which is the only thing Apple takes", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      applePayConfig().onAuthorized({}, actions)
    })

    await waitFor(() => {
      expect(actions.reject).toHaveBeenCalled()
    })
    const [error] = actions.reject.mock.calls[0] as [FakeApplePayError]
    expect(error).toBeInstanceOf(FakeApplePayError)
    expect(error.message).toBe("Gift card balance is insufficient.")
    // `unknown` is the only code that is not about a contact field.
    expect(error.code).toBe("unknown")
  })

  it("rejects with nothing at all where Apple's error type does not exist", async () => {
    // Unreachable in practice — no `ApplePayError` global means no Apple Pay
    // button was ever rendered — but `reject` is typed for that class alone, so
    // the alternative would be handing Apple a string it discards.
    delete (globalThis as { ApplePayError?: unknown }).ApplePayError
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      applePayConfig().onAuthorized({}, actions)
    })

    await waitFor(() => {
      expect(actions.reject).toHaveBeenCalledWith(undefined)
    })
  })

  it("does not burn the Adyen Session when the abort was its own", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    await mounted()
    await act(async () => {
      adyen.captured.dropinOptions.onSelect({ type: "applepay" })
    })

    const actions = { resolve: vi.fn(), reject: vi.fn() }
    await act(async () => {
      applePayConfig().onAuthorized({}, actions)
    })
    await waitFor(() => {
      expect(actions.reject).toHaveBeenCalled()
    })

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })
})
