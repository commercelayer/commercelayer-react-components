import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { type ReactNode, useEffect, useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PlaceOrderButton } from "#components/orders/PlaceOrderButton"
import { PlaceOrderContainer } from "#components/orders/PlaceOrderContainer"
import { PrivacyAndTermsCheckbox } from "#components/orders/PrivacyAndTermsCheckbox"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import { useTermsAndConditions } from "#hooks/useTermsAndConditions"
import {
  getAcceptedSnapshot,
  getCheckboxCount,
  registerCheckbox,
  resetTermsAcceptanceStore,
  setAccepted,
  subscribe,
} from "#utils/termsAcceptanceStore"

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({
      orders: { retrieve: vi.fn().mockResolvedValue({ id: "order-1", status: "pending" }) },
    }),
  }
})

// Privacy/terms live on the ORGANIZATION CONFIG, not on the order — the real
// shape of the checkout where this bug was reported.
vi.mock("#utils/organization", () => {
  const STABLE = { urls: { privacy: "https://org.example.com/privacy", terms: "https://org.example.com/terms" } }
  return { useOrganizationConfig: vi.fn(() => STABLE) }
})

// A card IS selected, so `card.brand` is truthy and the button's enabling
// condition depends on `isPermitted` alone.
vi.mock("#utils/getCardDetails", () => ({ default: vi.fn().mockReturnValue({ brand: "visa" }) }))

// Stable identities: mfe-checkout's OrderContext does not hand out a new
// `include` array on every render, and a churning one would mask the bug by
// forcing the container to recompute.
const INCLUDE: string[] = []
// biome-ignore lint/suspicious/noExplicitAny: test cast
const INCLUDE_LOADED: any = {}
const FNS = {
  add: vi.fn(),
  setOrder: vi.fn(),
  setOrderErrors: vi.fn(),
  setPaymentSource: vi.fn(),
  setPaymentMethodErrors: vi.fn(),
}
const NO_ERRORS: unknown[] = []

// biome-ignore lint/suspicious/noExplicitAny: test cast
const ORDER: any = {
  id: "order-1",
  status: "pending",
  total_amount_with_taxes_cents: 1000,
  // `<PlaceOrderButton>` routes on the Payments Model, and an order with
  // neither `available_payment_methods` nor `available_payment_settings` is
  // undetermined — it would get the inert button and every assertion here
  // would pass for the wrong reason.
  available_payment_methods: [{ id: "pm-1", payment_source_type: "stripe_payments" }],
  payment_method: { id: "pm-1", payment_source_type: "stripe_payments" },
  payment_source: { id: "ps-1", type: "stripe_payments" },
  billing_address: { id: "ba-1" },
  shipping_address: { id: "sa-1" },
  shipments: [],
  line_items: [],
  privacy_url: null,
  terms_url: null,
}

// biome-ignore lint/suspicious/noExplicitAny: test cast
function Providers({ children, order = ORDER }: { children: ReactNode; order?: any }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: "order-1",
          order,
          include: INCLUDE,
          includeLoaded: INCLUDE_LOADED,
          addResourceToInclude: FNS.add,
          setOrder: FNS.setOrder,
          setOrderErrors: FNS.setOrderErrors,
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
              currentPaymentMethodType: "stripe_payments",
              paymentSource: order?.payment_source ?? undefined,
              setPaymentSource: FNS.setPaymentSource,
              setPaymentMethodErrors: FNS.setPaymentMethodErrors,
              // biome-ignore lint/suspicious/noExplicitAny: test cast
              errors: NO_ERRORS as any,
            }}
          >
            {children}
          </PaymentMethodContext.Provider>
        </CustomerContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// termsAcceptanceStore
// ---------------------------------------------------------------------------

describe("termsAcceptanceStore", () => {
  beforeEach(() => resetTermsAcceptanceStore())

  it("starts from 'not accepted'", () => {
    expect(getAcceptedSnapshot("o1")).toBe(false)
  })

  it("notifies subscribers of the keyed order only", () => {
    const a = vi.fn()
    const b = vi.fn()
    subscribe("o1", a)
    subscribe("o2", b)
    setAccepted("o1", true)
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).not.toHaveBeenCalled()
  })

  it("does not notify when the value is unchanged", () => {
    const listener = vi.fn()
    subscribe("o1", listener)
    setAccepted("o1", false)
    expect(listener).not.toHaveBeenCalled()
  })

  it("keeps acceptance per order, so consent cannot leak across orders", () => {
    setAccepted("o1", true)
    expect(getAcceptedSnapshot("o1")).toBe(true)
    expect(getAcceptedSnapshot("o2")).toBe(false)
  })

  it("unsubscribes cleanly", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe("o1", listener)
    unsubscribe()
    setAccepted("o1", true)
    expect(listener).not.toHaveBeenCalled()
  })

  it("counts mounted checkboxes and resets acceptance when the last one leaves", () => {
    const off1 = registerCheckbox("o1")
    const off2 = registerCheckbox("o1")
    expect(getCheckboxCount("o1")).toBe(2)
    setAccepted("o1", true)

    off1()
    // One checkbox is still asking, so acceptance survives.
    expect(getCheckboxCount("o1")).toBe(1)
    expect(getAcceptedSnapshot("o1")).toBe(true)

    off2()
    expect(getCheckboxCount("o1")).toBe(0)
    expect(getAcceptedSnapshot("o1")).toBe(false)
  })

  it("shares one entry between checkbox and button before the order has loaded", () => {
    setAccepted(undefined, true)
    expect(getAcceptedSnapshot(undefined)).toBe(true)
    expect(getAcceptedSnapshot(null)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Regression: the reported bug
// ---------------------------------------------------------------------------

describe("REGRESSION: unchecked privacy/terms keeps PlaceOrderButton disabled", () => {
  beforeEach(() => resetTermsAcceptanceStore())

  it("stays disabled with a payment method selected and the checkbox unchecked", async () => {
    render(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true)
  })

  it("stays disabled when the checkbox mounts AFTER the container first computed isPermitted", async () => {
    // This is the exact shape of the original bug: acceptance used to live in
    // localStorage, survived a hard navigation as "true", and the late-mounting
    // checkbox reset it without telling the container to recompute.
    const { rerender } = render(
      <Providers>
        <PlaceOrderContainer>
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => expect(screen.getByRole("button")).toBeDefined())

    rerender(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })

    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true)
  })

  it("acceptance does not survive a remount, so a reload starts from unaccepted", async () => {
    const first = render(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"))
    })
    await waitFor(() => {
      expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false)
    })
    first.unmount()

    render(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true)
  })

  it("requires EVERY mounted checkbox to be accepted", async () => {
    render(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox data-testid="cb-1" />
          <PrivacyAndTermsCheckbox data-testid="cb-2" />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => expect(getCheckboxCount("order-1")).toBe(2))
    // Both controls render the same acceptance, so ticking one ticks both —
    // there is a single consent per order, never two that can disagree.
    await act(async () => {
      fireEvent.click(screen.getByTestId("cb-1"))
    })
    expect((screen.getByTestId("cb-1") as HTMLInputElement).checked).toBe(true)
    expect((screen.getByTestId("cb-2") as HTMLInputElement).checked).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Q15 diagnostic: acceptance required, but nothing asks for it
// ---------------------------------------------------------------------------

describe("diagnostic when acceptance is required but no checkbox is mounted", () => {
  beforeEach(() => resetTermsAcceptanceStore())
  afterEach(() => vi.restoreAllMocks())

  it("stays quiet when a checkbox mounts later in the same tree", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    function LateCheckbox(): React.JSX.Element | null {
      const [shown, setShown] = useState(false)
      useEffect(() => {
        setShown(true)
      }, [])
      return shown ? <PrivacyAndTermsCheckbox /> : null
    }
    render(
      <Providers>
        <PlaceOrderContainer>
          <LateCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining("no <PrivacyAndTermsCheckbox> is mounted")
    )
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true)
  })

  it("reports it once the gate is the only thing left blocking the button", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <Providers>
        <PlaceOrderContainer>
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("no <PrivacyAndTermsCheckbox> is mounted")
      )
    })
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true)
  })

  it("stays quiet when a checkbox is mounted", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <Providers>
        <PlaceOrderContainer>
          <PrivacyAndTermsCheckbox />
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => {
      expect(screen.getByRole("checkbox").getAttribute("disabled")).toBeNull()
    })
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining("no <PrivacyAndTermsCheckbox> is mounted")
    )
  })

  it("stays quiet when something else is already blocking the order", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <Providers order={{ ...ORDER, billing_address: null }}>
        <PlaceOrderContainer>
          <PlaceOrderButton />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => expect(screen.getByRole("button")).toBeDefined())
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining("no <PrivacyAndTermsCheckbox> is mounted")
    )
  })
})

// ---------------------------------------------------------------------------
// useTermsAndConditions — the supported channel for a custom checkbox
// ---------------------------------------------------------------------------

describe("useTermsAndConditions", () => {
  beforeEach(() => resetTermsAcceptanceStore())

  function CustomConsent(): React.JSX.Element {
    const { accepted, setAccepted } = useTermsAndConditions()
    return (
      <button type="button" data-testid="custom-consent" onClick={() => setAccepted(!accepted)}>
        {accepted ? "accepted" : "not accepted"}
      </button>
    )
  }

  it("lets a custom control open the gate without <PrivacyAndTermsCheckbox>", async () => {
    render(
      <Providers>
        <PlaceOrderContainer>
          <CustomConsent />
          <PlaceOrderButton data-testid="place-order" />
        </PlaceOrderContainer>
      </Providers>
    )
    await waitFor(() => expect(screen.getByTestId("place-order")).toBeDefined())
    expect(screen.getByTestId("place-order").hasAttribute("disabled")).toBe(true)

    await act(async () => {
      fireEvent.click(screen.getByTestId("custom-consent"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("place-order").hasAttribute("disabled")).toBe(false)
    })
    expect(screen.getByTestId("custom-consent").textContent).toBe("accepted")
  })

  it("reflects acceptance written elsewhere for the same order", async () => {
    render(
      <Providers>
        <CustomConsent />
      </Providers>
    )
    expect(screen.getByTestId("custom-consent").textContent).toBe("not accepted")
    await act(async () => {
      setAccepted("order-1", true)
    })
    expect(screen.getByTestId("custom-consent").textContent).toBe("accepted")
  })
})
