import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingBraintreePayment } from "#components/payment_settings/PaymentSettingBraintreePayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
} from "#utils/paymentGatewayStore"

/**
 * A fake braintree-web, deliberately shallow.
 *
 * Each module's `create` resolves to an object the tests then drive, so what is
 * under test is the sequence this component runs — tokenize, authenticate, hand
 * the nonce over — and the mapping from each step's outcome to the handoff's
 * four, which is where its decisions are.
 */
const bt = vi.hoisted(() => ({
  clientCreate: vi.fn(),
  hostedFieldsCreate: vi.fn(),
  threeDSecureCreate: vi.fn(),
  tokenize: vi.fn(),
  verifyCard: vi.fn(),
  hostedFieldsTeardown: vi.fn(),
  threeDSecureTeardown: vi.fn(),
  // The `validityChange` listener the component registered.
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  listeners: {} as Record<string, (event: any) => void>,
}))

vi.mock("braintree-web/client", () => ({ default: { create: bt.clientCreate } }))
vi.mock("braintree-web/hosted-fields", () => ({ default: { create: bt.hostedFieldsCreate } }))
vi.mock("braintree-web/three-d-secure", () => ({ default: { create: bt.threeDSecureCreate } }))

const { authorizeMock, createPaymentSessionMock, discardPaymentSessionMock } = vi.hoisted(() => ({
  authorizeMock: vi.fn(),
  createPaymentSessionMock: vi.fn(),
  discardPaymentSessionMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizeBraintreePaymentSession: authorizeMock,
    createPaymentSession: createPaymentSessionMock,
    discardPaymentSession: discardPaymentSessionMock,
  }
})

const BRAINTREE_SETTING = {
  id: "ps-braintree",
  type: "payment_setting_braintrees",
  name: "Braintree",
  // Braintree's server-side API key, not a browser credential: nothing reads it.
  public_key: "ynmp33kmgn2mw9rr",
} as unknown as PaymentSettingResource

const BRAINTREE_SESSION = {
  id: "session-bt",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 5100,
  amount_float: 51,
  payment_setting: { id: "ps-braintree", type: "payment_setting_braintrees" },
  response_data: { clientToken: "client-token-1" },
} as unknown as PaymentSession

const BILLING_ADDRESS = {
  first_name: "John",
  last_name: "Doe",
  line_1: "123 Main St",
  city: "New York",
  zip_code: "10001",
  state_code: "NY",
  country_code: "US",
  phone: "+1 212 000 0000",
}

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    // The card pays the remainder after a $20 gift card, which is what the
    // 3DS amount has to be — not this total.
    total_amount_with_taxes_cents: 7100,
    customer_email: "john@example.com",
    billing_address: BILLING_ADDRESS,
    available_payment_settings: [BRAINTREE_SETTING],
    payment_sessions: [BRAINTREE_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

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

function renderBraintree(
  currentOrder: Partial<Order> | null = order(),
  props: Partial<Parameters<typeof PaymentSettingBraintreePayment>[0]> = {}
) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingBraintreePayment containerClassName="braintree" {...props}>
          {({ isLoaded, lastErrorCode }) => (
            <>
              <span data-testid="loaded">{isLoaded ? "yes" : "no"}</span>
              <span data-testid="error-code">{lastErrorCode ?? ""}</span>
            </>
          )}
        </PaymentSettingBraintreePayment>
      </PaymentSetting>
    </Wrapper>
  )
}

async function renderLoaded(...args: Parameters<typeof renderBraintree>) {
  const result = renderBraintree(...args)
  await waitFor(() => {
    expect(screen.getByTestId("loaded").textContent).toBe("yes")
  })
  return result
}

/** The host collection this component is expected to have registered. */
function hostSubmit() {
  const { collection } = getHandoffSnapshot("order-1")
  if (collection?.by !== "host") {
    throw new Error(`expected a host collection, got ${JSON.stringify(collection)}`)
  }
  return collection.submit
}

async function submit() {
  let result: Awaited<ReturnType<ReturnType<typeof hostSubmit>>> | undefined
  await act(async () => {
    result = await hostSubmit()()
  })
  return result
}

function verified(info: {
  liabilityShifted: boolean
  liabilityShiftPossible: boolean
  status?: string
}) {
  return {
    nonce: "nonce-after-3ds",
    threeDSecureInfo: { status: "authenticate_successful", ...info },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  bt.listeners = {}
  bt.clientCreate.mockResolvedValue({ name: "client" })
  bt.hostedFieldsCreate.mockResolvedValue({
    tokenize: bt.tokenize,
    teardown: bt.hostedFieldsTeardown,
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    on: (event: string, listener: (payload: any) => void) => {
      bt.listeners[event] = listener
    },
  })
  bt.threeDSecureCreate.mockResolvedValue({
    verifyCard: bt.verifyCard,
    teardown: bt.threeDSecureTeardown,
  })
  bt.hostedFieldsTeardown.mockResolvedValue(undefined)
  bt.threeDSecureTeardown.mockResolvedValue(undefined)
  bt.tokenize.mockResolvedValue({ nonce: "nonce-raw", details: { bin: "400551" } })
  bt.verifyCard.mockResolvedValue(
    verified({ liabilityShifted: true, liabilityShiftPossible: true })
  )
  authorizeMock.mockResolvedValue({ status: "authorized" })
  createPaymentSessionMock.mockResolvedValue({ id: "session-new" })
  discardPaymentSessionMock.mockResolvedValue(undefined)
  getOrder.mockResolvedValue(order())
})

describe("<PaymentSettingBraintreePayment> mounting", () => {
  it("boots Braintree from the session's client token", async () => {
    await renderLoaded()

    expect(bt.clientCreate).toHaveBeenCalledWith({ authorization: "client-token-1" })
    expect(bt.threeDSecureCreate).toHaveBeenCalledWith({ client: { name: "client" }, version: 2 })
  })

  it("mounts each Hosted Field into a container of its own", async () => {
    const { container } = await renderLoaded()

    const { fields } = bt.hostedFieldsCreate.mock.calls[0]?.[0] ?? {}
    expect(Object.keys(fields)).toEqual(["number", "expirationDate", "cvv"])
    for (const field of Object.values(fields) as Array<{ container: HTMLElement }>) {
      expect(container.contains(field.container)).toBe(true)
    }
    // The label is ours to render; Braintree would reject it as an option.
    expect((fields as Record<string, object>).number).not.toHaveProperty("label")
    expect(screen.getByText("Card number")).toBeTruthy()
  })

  it("adds the cardholder name field only when asked for", async () => {
    await renderLoaded(order(), {
      fields: { cardholderName: { label: "Name", placeholder: "As on the card" } },
    })

    const { fields } = bt.hostedFieldsCreate.mock.calls[0]?.[0] ?? {}
    expect(Object.keys(fields)).toEqual(["cardholderName", "number", "expirationDate", "cvv"])
    expect(fields.cardholderName.placeholder).toBe("As on the card")
  })

  it("renders nothing for a setting that is not Braintree's", () => {
    const { container } = renderBraintree(
      order({
        available_payment_settings: [
          { id: "ps-manual", type: "payment_setting_manuals", name: "Wire" },
        ],
        payment_sessions: [],
      })
    )
    expect(container.querySelector(".braintree")).toBeNull()
    expect(bt.clientCreate).not.toHaveBeenCalled()
  })

  // The client token is per session, so before the shopper selects there is
  // nothing to boot from.
  it("shows no form until a session exists", () => {
    const { container } = renderBraintree(order({ payment_sessions: [] }))
    expect(container.querySelector(".braintree")).toBeNull()
    expect(bt.clientCreate).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collection).toBeNull()
  })

  it("leaves 3DS out when it is turned off", async () => {
    await renderLoaded(order(), { threeDSecure: false })
    expect(bt.threeDSecureCreate).not.toHaveBeenCalled()
  })

  it("tears Braintree down when the form goes away", async () => {
    const { unmount } = await renderLoaded()
    unmount()
    await waitFor(() => {
      expect(bt.hostedFieldsTeardown).toHaveBeenCalled()
      expect(bt.threeDSecureTeardown).toHaveBeenCalled()
    })
  })

  // `response_data` is not in every consumer's `fields` allowlist: a refetch
  // of the same session without it must not unmount the fields mid-typing.
  it("survives a refetch that arrives without the client token", async () => {
    const { rerender } = await renderLoaded()

    rerender(
      <Wrapper
        currentOrder={order({
          payment_sessions: [{ ...BRAINTREE_SESSION, response_data: {} }],
        })}
      >
        <PaymentSetting>
          <PaymentSettingBraintreePayment containerClassName="braintree" />
        </PaymentSetting>
      </Wrapper>
    )

    expect(bt.clientCreate).toHaveBeenCalledTimes(1)
    expect(bt.hostedFieldsTeardown).not.toHaveBeenCalled()
  })

  it("reports the form complete only once every field is valid", async () => {
    await renderLoaded()

    act(() => {
      bt.listeners.validityChange?.({
        fields: {
          number: { isValid: true },
          expirationDate: { isValid: true },
          cvv: { isValid: false },
        },
      })
    })
    expect(getHandoffSnapshot("order-1").collection).toMatchObject({ by: "host", isReady: false })

    act(() => {
      bt.listeners.validityChange?.({
        fields: {
          number: { isValid: true },
          expirationDate: { isValid: true },
          cvv: { isValid: true },
        },
      })
    })
    expect(getHandoffSnapshot("order-1").collection).toMatchObject({ by: "host", isReady: true })
  })
})

describe("<PaymentSettingBraintreePayment> an expired client token", () => {
  // The token lives a day and the session two, so a checkout reopened the next
  // day adopts a session Braintree will not boot from.
  it("replaces the session instead of adopting it again", async () => {
    bt.clientCreate.mockRejectedValue({ code: "CLIENT_AUTHORIZATION_INVALID" })

    renderBraintree()

    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledTimes(1)
    })
    expect(createPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "order-1", paymentSettingId: "ps-braintree" })
    )
    // The stale one is cleared like any superseded selection.
    expect(discardPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-bt" })
    )
  })

  // Every renewal is a new session, so a per-session allowance would renew
  // forever on an account that refuses every token.
  it("renews once, then reports", async () => {
    bt.clientCreate.mockRejectedValue({ code: "CLIENT_AUTHORIZATION_INVALID" })
    const fresh = {
      ...BRAINTREE_SESSION,
      id: "session-fresh",
      response_data: { clientToken: "client-token-2" },
    }

    const { rerender } = renderBraintree()
    await waitFor(() => {
      expect(createPaymentSessionMock).toHaveBeenCalledTimes(1)
    })

    // The fresh session arrives, and Braintree refuses its token as well.
    rerender(
      <Wrapper currentOrder={order({ payment_sessions: [fresh] })}>
        <PaymentSetting>
          <PaymentSettingBraintreePayment containerClassName="braintree">
            {({ lastErrorCode }) => <span data-testid="error-code">{lastErrorCode ?? ""}</span>}
          </PaymentSettingBraintreePayment>
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(bt.clientCreate).toHaveBeenLastCalledWith({ authorization: "client-token-2" })
    })
    await waitFor(() => {
      expect(screen.getByTestId("error-code").textContent).toBe("CLIENT_AUTHORIZATION_INVALID")
    })
    expect(createPaymentSessionMock).toHaveBeenCalledTimes(1)
  })

  // A renewal that brings no new session — the create failed, say — leaves the
  // same form standing, and a blank one says nothing.
  it("reports when the renewal brought no new session", async () => {
    bt.clientCreate.mockRejectedValue({ code: "CLIENT_AUTHORIZATION_INVALID" })
    createPaymentSessionMock.mockRejectedValue(new Error("422"))

    renderBraintree()

    await waitFor(() => {
      expect(screen.getByTestId("error-code").textContent).toBe("CLIENT_AUTHORIZATION_INVALID")
    })
  })
})

describe("<PaymentSettingBraintreePayment> collecting", () => {
  it("tokenizes, authenticates and authorizes the authenticated nonce", async () => {
    await renderLoaded()

    await expect(submit()).resolves.toEqual({ status: "completed" })

    expect(bt.verifyCard).toHaveBeenCalledWith(
      expect.objectContaining({
        nonce: "nonce-raw",
        bin: "400551",
        // The session's amount, not the order's $71.
        amount: "51.00",
        email: "john@example.com",
        billingAddress: expect.objectContaining({
          givenName: "John",
          surname: "Doe",
          streetAddress: "123 Main St",
          postalCode: "10001",
          countryCodeAlpha2: "US",
        }),
      })
    )
    // The nonce 3DS handed back, not the one it was given.
    expect(authorizeMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-bt", nonce: "nonce-after-3ds" })
    )
  })

  it("falls back to amount_cents when amount_float is not served", async () => {
    const { amount_float: _float, ...withoutFloat } = BRAINTREE_SESSION as unknown as Record<
      string,
      unknown
    >
    await renderLoaded(order({ payment_sessions: [withoutFloat] }))

    await submit()

    expect(bt.verifyCard).toHaveBeenCalledWith(expect.objectContaining({ amount: "51.00" }))
  })

  it("marks the order as collecting for the length of the payment", async () => {
    // The 3DS challenge can take as long as the shopper needs, and the session
    // records nothing until the money has moved — so a switch of method in the
    // meantime would find a session that looks safe to delete.
    await renderLoaded()

    let collectingDuringAuthorization: boolean | undefined
    authorizeMock.mockImplementation(async () => {
      collectingDuringAuthorization = isCollecting("order-1")
      return { status: "authorized" }
    })

    await submit()

    expect(collectingDuringAuthorization).toBe(true)
    expect(isCollecting("order-1")).toBe(false)
  })

  it.each(["HOSTED_FIELDS_FIELDS_EMPTY", "HOSTED_FIELDS_FIELDS_INVALID"])(
    "stops on %s without reporting a failure, and says why",
    async (code) => {
      await renderLoaded()
      bt.tokenize.mockRejectedValue({ code })

      await expect(submit()).resolves.toEqual({ status: "incomplete" })

      // Hosted Fields mark nothing on a field the shopper never left, so the
      // reason has to reach the application.
      expect(screen.getByTestId("error-code").textContent).toBe(code)
      expect(bt.verifyCard).not.toHaveBeenCalled()
      expect(authorizeMock).not.toHaveBeenCalled()
    }
  )

  it("refuses when the shopper could have authenticated and did not", async () => {
    await renderLoaded()
    bt.verifyCard.mockResolvedValue(
      verified({
        liabilityShifted: false,
        liabilityShiftPossible: true,
        status: "authenticate_failed",
      })
    )

    await expect(submit()).resolves.toEqual({ status: "failed", code: "authenticate_failed" })
    expect(authorizeMock).not.toHaveBeenCalled()
  })

  // Commerce Layer authorizes whatever nonce it is given, so this is the only
  // place a 3DS outcome is enforced — and a card 3DS could not cover at all
  // goes ahead by default, with the merchant carrying the risk.
  it("pays when 3DS was not possible", async () => {
    await renderLoaded()
    bt.verifyCard.mockResolvedValue(
      verified({
        liabilityShifted: false,
        liabilityShiftPossible: false,
        status: "lookup_not_enrolled",
      })
    )

    await expect(submit()).resolves.toEqual({ status: "completed" })
  })

  it("refuses when 3DS was not possible and the liability shift is required", async () => {
    await renderLoaded(order(), { requireLiabilityShift: true })
    bt.verifyCard.mockResolvedValue(
      verified({
        liabilityShifted: false,
        liabilityShiftPossible: false,
        status: "lookup_not_enrolled",
      })
    )

    await expect(submit()).resolves.toEqual({ status: "failed", code: "lookup_not_enrolled" })
    expect(authorizeMock).not.toHaveBeenCalled()
  })

  it("reports a 3DS error as a verdict: nothing has been charged", async () => {
    await renderLoaded()
    bt.verifyCard.mockRejectedValue({ code: "THREEDS_LOOKUP_ERROR" })

    await expect(submit()).resolves.toEqual({ status: "failed", code: "THREEDS_LOOKUP_ERROR" })
    expect(authorizeMock).not.toHaveBeenCalled()
  })

  it("authorizes the tokenized nonce straight away when 3DS is off", async () => {
    await renderLoaded(order(), { threeDSecure: false })

    await expect(submit()).resolves.toEqual({ status: "completed" })
    expect(authorizeMock).toHaveBeenCalledWith(expect.objectContaining({ nonce: "nonce-raw" }))
  })

  it("reports Braintree's refusal as a verdict", async () => {
    await renderLoaded()
    authorizeMock.mockResolvedValue({ status: "refused", code: "declined" })

    await expect(submit()).resolves.toEqual({ status: "failed", code: "declined" })
    expect(screen.getByTestId("error-code").textContent).toBe("declined")
  })

  // The money may have moved: nothing may be rolled back on this one.
  it("reports an authorization that never settled as unknown", async () => {
    await renderLoaded()
    authorizeMock.mockResolvedValue({ status: "unknown", code: "authorization_pending" })

    await expect(submit()).resolves.toEqual({ status: "unknown", code: "authorization_pending" })
  })

  it("reports an unexpected throw after tokenizing as unknown", async () => {
    await renderLoaded()
    authorizeMock.mockRejectedValue(new Error("boom"))

    await expect(submit()).resolves.toMatchObject({ status: "unknown" })
    expect(isCollecting("order-1")).toBe(false)
  })
})
