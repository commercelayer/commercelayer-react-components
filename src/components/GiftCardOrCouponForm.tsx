import useRapidForm from 'rapid-form'
import React, { FunctionComponent, ReactNode, useContext, useRef } from 'react'
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import OrderContext from '#context/OrderContext'
import { has, isEmpty } from 'lodash'
import components from '#config/components'

const propTypes = components.GiftCardOrCouponForm.propTypes

type GiftCardOrCouponFormProps = {
  children: ReactNode
  reset?: boolean
  onSubmit?: (response: { success: boolean }) => void
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const GiftCardOrCouponForm: FunctionComponent<GiftCardOrCouponFormProps> = (
  props
) => {
  const { children, autoComplete = 'on', reset = false, onSubmit, ...p } = props
  const { validation, values } = useRapidForm()
  const { setGiftCardOrCouponCode, order } = useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = has(values, 'gift_card_or_coupon_code')
      ? values['gift_card_or_coupon_code'].value
      : undefined
    if (code) {
      const { success } = await setGiftCardOrCouponCode({ code })
      onSubmit && onSubmit({ success })
      success && e.target.reset()
    }
  }
  return order?.giftCardOrCouponCode || isEmpty(order) ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ validation }}>
      <form
        ref={ref}
        autoComplete={autoComplete}
        onSubmit={handleSubmit}
        {...p}
      >
        {children}
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

GiftCardOrCouponForm.propTypes = propTypes

export default GiftCardOrCouponForm
