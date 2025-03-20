import type { Order } from "@commercelayer/sdk"

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
  const refusalReasonCode =
    // @ts-expect-error No type for payment_response refusalReasonCode
    getPaymentSource?.payment_response?.refusalReasonCode
  if (refusalReasonCode !== "12") return null
  const isGiftCard =
    // @ts-expect-error No type for payment_request_data
    getPaymentSource?.payment_request_data?.payment_method?.type === "giftcard"
  if (!isGiftCard) return null
  // @ts-expect-error No type for payment_response additionalData
  const additionalData = getPaymentSource?.payment_response?.additionalData
  // @ts-expect-error No type for payment_response amount
  const amount = getPaymentSource?.payment_response?.amount?.value as number
  const giftCardData: GiftCardData = {
    cardSummary: additionalData?.cardSummary,
    currentBalanceValue:
      amount ?? Number.parseInt(additionalData?.currentBalanceValue),
    currentBalanceCurrency: additionalData?.currentBalanceCurrency,
    cardBrand:
      additionalData?.originalSelectedBrand ?? additionalData?.paymentMethod,
    formattedBalanceValue: additionalData?.currentBalanceValue,
  }
  const orderTotal =
    order?.total_amount_with_taxes_cents != null
      ? order?.total_amount_with_taxes_cents - giftCardData.currentBalanceValue
      : 0
  const formattedOrderTotal = (orderTotal / 100).toLocaleString(
    order.language_code ?? "en",
    {
      style: "currency",
      currency: order?.currency_code ?? "USD",
    },
  )
  const formattedCurrentBalance = (
    giftCardData.currentBalanceValue / 100
  ).toLocaleString(order.language_code ?? "en", {
    style: "currency",
    currency: order?.currency_code ?? "USD",
  })
  giftCardData.formattedBalanceValue = formattedCurrentBalance
  return { ...giftCardData, formattedOrderTotal }
}
