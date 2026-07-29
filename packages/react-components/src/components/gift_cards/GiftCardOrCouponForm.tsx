import type { Order } from "@commercelayer/sdk"
import { useRapidForm } from "rapid-form"
import { type JSX, useCallback, useContext, useEffect, useState } from "react"
import CouponAndGiftCardFormContext from "#context/CouponAndGiftCardFormContext"
import OrderContext from "#context/OrderContext"
import type { OrderCodeType } from "#reducers/OrderReducer"
import type { DefaultChildrenType } from "#typings/globals"

// "gift_card_or_coupon_code" is accepted by the CL API as a universal code field
// but is not part of the OrderCodeType union — kept as a local widened type
type FormCodeType = OrderCodeType | "gift_card_or_coupon_code"

interface Props extends Omit<JSX.IntrinsicElements["form"], "onSubmit"> {
  codeType?: OrderCodeType
  children: DefaultChildrenType
  onSubmit?: (response: { success: boolean; value: string; order?: Order }) => void
}

export function GiftCardOrCouponForm(props: Props): JSX.Element | null {
  const { children, codeType, autoComplete = "on", onSubmit, ...p } = props
  const { refValidation, values } = useRapidForm()
  const { setGiftCardOrCouponCode, order, errors, setOrderErrors } = useContext(OrderContext)
  const [type, setType] = useState<FormCodeType | undefined>(codeType)

  // When the active field is emptied, drop the *other* fields' errors from the order.
  useEffect(() => {
    if (type == null || values[type]?.value !== "") return
    const current = errors ?? []
    const fieldErrors = current.filter((e) => e.field === type)
    // Bail when filtering removes nothing. `fieldErrors` is an order-preserving subset,
    // so equal lengths mean identical contents — dispatching it would only mint a fresh
    // `errors` array reference, which this effect depends on, re-firing it forever
    // (React 19 hard-crashes with "Maximum update depth exceeded"). Same identity-churn
    // failure class as docs/adr/0001-payment-source-effect-invariants.md.
    if (fieldErrors.length === current.length) return
    setOrderErrors(fieldErrors)
    onSubmit?.({ value: "", success: false })
  }, [values, errors, type, setOrderErrors, onSubmit])

  // Derive the active code type from the current order state
  useEffect(() => {
    if (codeType != null) {
      setType(codeType)
      return
    }
    if (order?.gift_card_code && !order?.coupon_code) {
      setType("coupon_code")
    } else if (!order?.gift_card_code && order?.coupon_code) {
      setType("gift_card_code")
    } else if (!order?.gift_card_code && !order?.coupon_code) {
      setType("gift_card_or_coupon_code")
    }
  }, [order, codeType])

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      if (type == null || setGiftCardOrCouponCode == null) return
      const form = e.currentTarget
      // Read the typed code straight from the form DOM rather than rapid-form's tracked
      // `values`. rapid-form v4 only tracks a field that is `required` or has a validation
      // config, so a `required={false}` field (e.g. mfe-checkout) may never be tracked and
      // `values[type]` stays undefined — which silently made submit a no-op. The form
      // element is authoritative and available here regardless of any wiring/timing.
      const field = form.elements.namedItem(type) as HTMLInputElement | null
      const code = field?.value?.trim() ?? ""
      if (code === "") return
      const { success, order: updatedOrder } = await setGiftCardOrCouponCode({
        code,
        // "gift_card_or_coupon_code" is accepted by the CL API at runtime
        codeType: type as OrderCodeType,
      })
      onSubmit?.({ success, value: code, order: updatedOrder })
      if (success) form.reset()
    },
    [type, setGiftCardOrCouponCode, onSubmit]
  )

  if (codeType != null && order?.[codeType] != null && order?.[codeType] !== "") {
    return null
  }
  return (order?.gift_card_code && order?.coupon_code) || order == null ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ codeType: type as OrderCodeType }}>
      <form
        // Two rapid-form v4 behaviours are neutralised here so submission is robust:
        // 1. `resetOnSubmit: false` — by default rapid-form attaches its own native
        //    `submit` listener that resets the form; native listeners fire before React's
        //    delegated `onSubmit`, so it would wipe the input before `handleSubmit` reads
        //    the DOM. Disabling it means rapid-form attaches no submit listener at all, so
        //    the typed value survives (and the field is now preserved on failure, cleared
        //    only by our own `form.reset()` on success).
        // 2. Pass-through `validations` for the active field — rapid-form only tracks a
        //    field that is `required` or validated, so a `required={false}` field (e.g.
        //    mfe-checkout) would otherwise stay untracked. This keeps `values[type]`
        //    populated for the error-clearing effect without imposing any real constraint.
        ref={(node) => {
          refValidation(
            node,
            type != null
              ? { resetOnSubmit: false, validations: { [type]: { validation: () => true } } }
              : { resetOnSubmit: false }
          )
        }}
        autoComplete={autoComplete}
        onSubmit={handleSubmit}
        {...p}
      >
        {children}
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

export default GiftCardOrCouponForm
