import type { Order } from "@commercelayer/sdk"
import { type CurrencyCode, formatCentsToCurrency } from "../currencies"

export interface GiftCardData {
  cardSummary: string
  currentBalanceValue: number
  currentBalanceCurrency: string
  formattedBalanceValue: string
  cardBrand: string
}

interface Props {
  order?: Order
}

interface ReturnTypes extends GiftCardData {
  formattedOrderTotal: string
}

export function manageGiftCard({ order }: Props): ReturnTypes | null {
  if (!order) return null
  if (!order?.payment_source) return null
  const getPaymentSource =
    order.payment_source?.type === "adyen_payments"
      ? order.payment_source
      : null
  if (!getPaymentSource) return null
  const errorCode =
    // @ts-expect-error No type for payment_response errorCode
    getPaymentSource?.payment_response?.errorCode
  if (errorCode) return null
  const isGiftCard =
    // @ts-expect-error No type for payment_request_data
    getPaymentSource?.payment_request_data?.payment_method?.type === "giftcard"
  if (!isGiftCard) return null
  // @ts-expect-error No type for payment_response additionalData
  const additionalData = getPaymentSource?.payment_response?.additionalData
  const amount =
    // @ts-expect-error No type for payment_response amount
    getPaymentSource?.payment_response?.amount?.value ?? (0 as number)
  const giftCardData: GiftCardData = {
    cardSummary: additionalData?.cardSummary ?? "",
    currentBalanceValue:
      amount ?? Number.parseInt(additionalData?.currentBalanceValue) ?? 0,
    currentBalanceCurrency: additionalData?.currentBalanceCurrency ?? "",
    cardBrand:
      additionalData?.originalSelectedBrand ??
      additionalData?.paymentMethod ??
      "",
    formattedBalanceValue: additionalData?.currentBalanceValue ?? "",
  }
  const orderTotal =
    order?.total_amount_with_taxes_cents != null
      ? order?.total_amount_with_taxes_cents - giftCardData.currentBalanceValue
      : 0
  const currencyCode =
    (order?.currency_code as CurrencyCode) ?? ("USD" as CurrencyCode)
  const formattedOrderTotal = formatCentsToCurrency(orderTotal, currencyCode)
  const formattedCurrentBalance = formatCentsToCurrency(
    giftCardData.currentBalanceValue,
    currencyCode,
  )
  giftCardData.formattedBalanceValue = formattedCurrentBalance
  if (giftCardData.cardSummary === "") return null
  return { ...giftCardData, formattedOrderTotal }
}
