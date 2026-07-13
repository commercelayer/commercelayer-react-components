import type { Order } from "@commercelayer/sdk"
import { useRapidForm } from "rapid-form"
import { type JSX, useCallback, useContext, useEffect, useState } from "react"
import CouponAndGiftCardFormContext from "#context/CouponAndGiftCardFormContext"
import OrderContext from "#context/OrderContext"
import { useFormWiring } from "#hooks/useFormWiring"
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
  const wireForm = useFormWiring(refValidation)
  const { setGiftCardOrCouponCode, order, errors, setOrderErrors } = useContext(OrderContext)
  const [type, setType] = useState<FormCodeType | undefined>(codeType)

  // Propagate or clear order errors when the field is empty
  useEffect(() => {
    if (type == null || values[type]?.value !== "") return
    const fieldErrors = (errors ?? []).filter((e) => e.field === type)
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
      if (type == null || values[type] == null || setGiftCardOrCouponCode == null) return
      const form = e.currentTarget
      const code = values[type].value
      const { success, order: updatedOrder } = await setGiftCardOrCouponCode({
        code,
        // "gift_card_or_coupon_code" is accepted by the CL API at runtime
        codeType: type as OrderCodeType,
      })
      onSubmit?.({ success, value: code, order: updatedOrder })
      if (success) form.reset()
    },
    [type, values, setGiftCardOrCouponCode, onSubmit]
  )

  if (codeType != null && order?.[codeType] != null && order?.[codeType] !== "") {
    return null
  }
  return (order?.gift_card_code && order?.coupon_code) || order == null ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ codeType: type as OrderCodeType }}>
      <form ref={wireForm} autoComplete={autoComplete} onSubmit={handleSubmit} {...p}>
        {children}
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

export default GiftCardOrCouponForm
