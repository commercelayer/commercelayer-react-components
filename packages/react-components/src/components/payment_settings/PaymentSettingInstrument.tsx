import { type PaymentInstrument, readPaymentInstrument } from "@commercelayer/core-components"
import type { JSX, ReactNode } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"

export interface PaymentSettingInstrumentChildrenProps
  extends Omit<PaymentSettingInstrumentProps, "children"> {
  /** The instrument as the API sends it, for anything not mapped below. */
  paymentInstrument: PaymentInstrument
  /** True when the brand and last digits of a card are known. */
  isCard: boolean
  /** The payment method as the gateway names it, e.g. `paypal` or `klarna_account`. */
  issuerType?: string
  /**
   * `issuerType` made readable, with each gateway's spelling folded into one:
   * `PayPal`, `Klarna`, `Apple Pay`. Undefined for a plain card.
   */
  issuerName?: string
  /** The card brand as the gateway names it, e.g. `visa`. */
  cardType?: string
  /** `cardType` made readable, e.g. `American express` for `american_express`. */
  brandName?: string
  cardLastDigits?: string
  cardExpiryMonth?: number | string
  cardExpiryYear?: number | string
  cardHolderName?: string
  accountEmail?: string
  /**
   * The card brand's or the payment method's icon, from the same set
   * `<PaymentSourceBrandIcon>` uses. Undefined for a method the set has no
   * artwork for, rather than a URL that fails to load.
   */
  iconUrl?: string
  /** What the component renders when it has no children. */
  label: string
}

export interface PaymentSettingInstrumentProps
  extends Omit<JSX.IntrinsicElements["span"], "children"> {
  children?: ChildrenFunction<PaymentSettingInstrumentChildrenProps>
  /**
   * Rendered instead when there is no instrument to show: a setting with no
   * gateway behind it, such as a manual payment, never gets one. Typically
   * `<PaymentSettingName />`.
   */
  fallback?: ReactNode
}

const ICONS_URL = "//data.commercelayer.app/assets/images/icons/credit-cards/color"

/**
 * Non-card methods, keyed by every spelling a gateway uses for them.
 *
 * `issuer_type` is the gateway's own name for the payment method — Adyen's
 * `paymentMethod.type`, Stripe's payment method `type`, or the wallet a Stripe
 * card was paid through — so one method arrives under several names. `icon`
 * is set only where the icon set has artwork; the rest fall back to text.
 */
const ISSUERS: Record<string, { name: string; icon?: string }> = {
  paypal: { name: "PayPal", icon: "paypal" },
  klarna: { name: "Klarna", icon: "klarna" },
  klarna_account: { name: "Klarna", icon: "klarna" },
  klarna_paynow: { name: "Klarna", icon: "klarna" },
  klarna_b2b: { name: "Klarna", icon: "klarna" },
  applepay: { name: "Apple Pay", icon: "apple_pay" },
  apple_pay: { name: "Apple Pay", icon: "apple_pay" },
  googlepay: { name: "Google Pay", icon: "google_pay" },
  paywithgoogle: { name: "Google Pay", icon: "google_pay" },
  google_pay: { name: "Google Pay", icon: "google_pay" },
  link: { name: "Link", icon: "link" },
  ideal: { name: "iDEAL", icon: "ideal" },
  amazon_pay: { name: "Amazon Pay" },
  amazonpay: { name: "Amazon Pay" },
}

/** Same rule as `<PaymentSourceBrandName>`, so both models name a brand alike. */
function readableBrand(brand?: string): string | undefined {
  if (brand == null || brand === "") return undefined
  const spaced = brand.replace(/_|-/gm, " ")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

/**
 * What the shopper paid with on the selected setting: the card brand and last
 * digits, or the payment method — PayPal, Klarna, a wallet.
 *
 * Renders `fallback`, or nothing, until the API knows: `payment_instrument`
 * is filled once the payment is authorized, so this belongs on a recap — a
 * thank-you page, or `<PaymentSetting readonly>` after placing — rather than on
 * the selector, where it would always be empty.
 *
 * Without children it renders `Visa •••• 4242` for a card and the method's
 * name otherwise. Never the account email: that is the shopper's personal
 * data, and the method's name is what tells them how they paid.
 */
export function PaymentSettingInstrument({
  children,
  fallback,
  ...props
}: PaymentSettingInstrumentProps): JSX.Element | null {
  const { currentPaymentSession } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingInstrument",
    key: "setting",
  })
  const instrument = readPaymentInstrument(currentPaymentSession)
  if (instrument == null) return fallback != null ? <>{fallback}</> : null

  const cardType = instrument.card_type
  const brandName = readableBrand(cardType)
  const cardLastDigits = instrument.card_last_digits
  // A card wins over its wallet: a card paid through Apple Pay is still
  // recognised by the shopper as their Visa ending in 4242.
  const isCard = brandName != null && cardLastDigits != null
  const issuer = ISSUERS[instrument.issuer_type ?? ""]
  const issuerName = isCard ? undefined : (issuer?.name ?? readableBrand(instrument.issuer_type))
  const label = isCard ? `${brandName} •••• ${cardLastDigits}` : (issuerName ?? brandName ?? "")
  const icon = isCard ? cardType : issuer?.icon

  const childrenProps: PaymentSettingInstrumentChildrenProps = {
    ...props,
    paymentInstrument: instrument,
    isCard,
    issuerType: instrument.issuer_type,
    issuerName,
    cardType,
    brandName,
    cardLastDigits,
    cardExpiryMonth: instrument.card_expiry_month,
    cardExpiryYear: instrument.card_expiry_year,
    cardHolderName: instrument.card_holder_name,
    accountEmail: instrument.account_email,
    iconUrl: icon != null ? `${ICONS_URL}/${icon}.svg` : undefined,
    label,
  }

  return children ? <Parent {...childrenProps}>{children}</Parent> : <span {...props}>{label}</span>
}

export default PaymentSettingInstrument
