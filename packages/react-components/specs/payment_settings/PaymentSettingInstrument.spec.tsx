import type { Order } from "@commercelayer/sdk"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingInstrument } from "#components/payment_settings/PaymentSettingInstrument"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

// `public_key` because a Stripe setting without one is skipped as unusable.
const STRIPE = {
  id: "ps-stripe",
  type: "payment_setting_stripes",
  name: "Stripe",
  public_key: "pk_test_123",
}

// The instrument Stripe reports for a test Visa, as the API stores it.
const VISA = {
  card_type: "visa",
  payment_id: "pm_1ULltUDtxYOB6MQVpTbaSy8A",
  issuer_type: "card",
  card_expiry_year: 2028,
  card_fingerprint: "FnbDgA9WDd203xvY",
  card_last_digits: "4242",
  card_expiry_month: 1,
}

function order(paymentInstrument: unknown): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [STRIPE],
    payment_sessions: [
      {
        id: "session-1",
        type: "payment_sessions",
        status: "authorized",
        payment_setting: STRIPE,
        payment_instrument: paymentInstrument,
      },
    ],
  } as unknown as Partial<Order>
}

function renderInstrument(currentOrder: Partial<Order>, children?: ReactNode) {
  return render(
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: currentOrder,
            include: ["payment_sessions.payment_setting", "payment_sessions.payment_authorization"],
            includeLoaded: {
              "payment_sessions.payment_setting": true,
              "payment_sessions.payment_authorization": true,
            },
            addResourceToInclude: vi.fn(),
            getOrder: vi.fn(),
          } as never
        }
      >
        <PaymentSetting readonly>
          {children ?? <PaymentSettingInstrument data-testid="instrument" />}
        </PaymentSetting>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("PaymentSettingInstrument", () => {
  it("renders the card brand and last digits by default", () => {
    renderInstrument(order(VISA))
    expect(screen.getByTestId("instrument").textContent).toBe("Visa •••• 4242")
  })

  it("renders nothing before the API knows the instrument", () => {
    // `{}` is the column's default until the payment is authorized.
    renderInstrument(order({}))
    expect(screen.queryByTestId("instrument")).toBeNull()
  })

  it("renders the fallback when there is no instrument", () => {
    renderInstrument(
      order({}),
      <PaymentSettingInstrument fallback={<span data-testid="fallback">Bank transfer</span>} />
    )
    expect(screen.getByTestId("fallback").textContent).toBe("Bank transfer")
  })

  it("names the method rather than the account for PayPal", () => {
    // What Stripe reports for a PayPal payment. The email is the shopper's own
    // data and is left out of the default rendering on purpose.
    renderInstrument(
      order({
        account_id: "DBORPRPPK23GA",
        payment_id: "pm_1ULnJlDtxYOB6MQVup6uMpY9",
        issuer_type: "paypal",
        account_email: "fake_payer@personal.example.com",
      })
    )
    expect(screen.getByTestId("instrument").textContent).toBe("PayPal")
  })

  it("folds each gateway's spelling of a method into one name and icon", () => {
    // Adyen's type for Klarna's pay-later; Stripe calls the same thing `klarna`.
    renderInstrument(
      order({ issuer_type: "klarna_account" }),
      <PaymentSettingInstrument>
        {({ isCard, issuerName, iconUrl }) => (
          <span data-testid="custom">{`${isCard}|${issuerName}|${iconUrl}`}</span>
        )}
      </PaymentSettingInstrument>
    )
    expect(screen.getByTestId("custom").textContent).toBe(
      "false|Klarna|//data.commercelayer.app/assets/images/icons/credit-cards/color/klarna.svg"
    )
  })

  it("gives no icon for a method the icon set has no artwork for", () => {
    renderInstrument(
      order({ issuer_type: "amazon_pay" }),
      <PaymentSettingInstrument>
        {({ label, iconUrl }) => <span data-testid="custom">{`${label}|${iconUrl}`}</span>}
      </PaymentSettingInstrument>
    )
    expect(screen.getByTestId("custom").textContent).toBe("Amazon Pay|undefined")
  })

  it("names an unknown method from its issuer type", () => {
    renderInstrument(order({ issuer_type: "us_bank_account", account_email: "a@b.c" }))
    expect(screen.getByTestId("instrument").textContent).toBe("Us bank account")
  })

  it("treats a card paid through a wallet as the card", () => {
    // Stripe puts the wallet in `issuer_type` and still fills the card fields.
    renderInstrument(order({ ...VISA, issuer_type: "apple_pay" }))
    expect(screen.getByTestId("instrument").textContent).toBe("Visa •••• 4242")
  })

  it("hands the mapped fields and the brand icon to function children", () => {
    renderInstrument(
      order({ ...VISA, card_type: "american_express" }),
      <PaymentSettingInstrument>
        {({ brandName, cardLastDigits, cardExpiryMonth, cardExpiryYear, iconUrl }) => (
          <span data-testid="custom">
            {`${brandName}|${cardLastDigits}|${cardExpiryMonth}/${cardExpiryYear}|${iconUrl}`}
          </span>
        )}
      </PaymentSettingInstrument>
    )
    expect(screen.getByTestId("custom").textContent).toBe(
      "American express|4242|1/2028|//data.commercelayer.app/assets/images/icons/credit-cards/color/american_express.svg"
    )
  })
})
