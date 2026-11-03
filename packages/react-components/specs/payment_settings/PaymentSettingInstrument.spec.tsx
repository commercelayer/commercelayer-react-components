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

const BRAINTREE = { id: "ps-braintree", type: "payment_setting_braintrees", name: "Braintree" }

function order(paymentInstrument: unknown, setting: object = STRIPE): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [setting],
    payment_sessions: [
      {
        id: "session-1",
        type: "payment_sessions",
        status: "authorized",
        payment_setting: setting,
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
      // `amex.svg`: the icon set has no `american_express.svg`.
      "American express|4242|1/2028|//data.commercelayer.app/assets/images/icons/credit-cards/color/amex.svg"
    )
  })

  // Braintree names no method: a PayPal payment through it would read as
  // nothing. As the API stores it for a PayPal approval through Braintree.
  it("names PayPal through Braintree, whose instrument carries no issuer type", () => {
    renderInstrument(
      order({ account_id: "JE6HTK628998C", account_email: "buyer@personal.example.com" }, BRAINTREE)
    )
    expect(screen.getByTestId("instrument").textContent).toBe("PayPal")
  })

  it("still names a Braintree card by its brand and digits", () => {
    renderInstrument(
      order(
        {
          card_type: "VISA",
          card_last_digits: "1881",
          card_expiry_month: 12,
          card_expiry_year: 2027,
        },
        BRAINTREE
      )
    )
    expect(screen.getByTestId("instrument").textContent).toBe("Visa •••• 1881")
  })

  // As the API stores an Apple Pay payment through Braintree: a plain card, in
  // Braintree's upper case. The icon set's files are lower case.
  it("points at the icon set's file whatever case the gateway spells the brand in", () => {
    renderInstrument(
      order(
        {
          card_type: "MASTERCARD",
          card_last_digits: "0049",
          card_expiry_month: 12,
          card_expiry_year: 2026,
        },
        BRAINTREE
      ),
      <PaymentSettingInstrument>
        {({ label, iconUrl }) => <span data-testid="custom">{`${label}|${iconUrl}`}</span>}
      </PaymentSettingInstrument>
    )
    expect(screen.getByTestId("custom").textContent).toBe(
      "Mastercard •••• 0049|//data.commercelayer.app/assets/images/icons/credit-cards/color/mastercard.svg"
    )
  })

  it("folds Braintree's long brand names onto the icon set's short ones", () => {
    renderInstrument(
      order({ card_type: "AMERICAN_EXPRESS", card_last_digits: "0005" }, BRAINTREE),
      <PaymentSettingInstrument>
        {({ label, iconUrl }) => <span data-testid="custom">{`${label}|${iconUrl}`}</span>}
      </PaymentSettingInstrument>
    )
    expect(screen.getByTestId("custom").textContent).toBe(
      "American express •••• 0005|//data.commercelayer.app/assets/images/icons/credit-cards/color/amex.svg"
    )
  })

  // PayPal fills no issuer type either; whatever pays its setting is PayPal.
  it("names PayPal for the PayPal payment setting", () => {
    renderInstrument(
      order(
        { account_id: "PAYER1", account_email: "buyer@personal.example.com" },
        {
          id: "ps-paypal",
          type: "payment_setting_paypals",
          name: "PayPal",
          client_id: "paypal-client-id",
        }
      )
    )
    expect(screen.getByTestId("instrument").textContent).toBe("PayPal")
  })
})
