import { useRapidForm } from 'rapid-form'
import { useContext, useEffect, useRef, useState, type JSX } from 'react';
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import OrderContext from '#context/OrderContext'
import type { OrderCodeType } from '#reducers/OrderReducer'
import type { Order } from '@commercelayer/sdk'
import type { DefaultChildrenType } from '#typings/globals'

interface Props extends Omit<JSX.IntrinsicElements['form'], 'onSubmit'> {
  codeType?: OrderCodeType
  children: DefaultChildrenType
  onSubmit?: (response: {
    success: boolean
    value: string
    order?: Order
  }) => void
}

export function GiftCardOrCouponForm(props: Props): JSX.Element | null {
  const { children, codeType, autoComplete = 'on', onSubmit, ...p } = props
  const { validation, values, reset } = useRapidForm()
  const { setGiftCardOrCouponCode, order, errors, setOrderErrors } =
    useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  const [type, setType] = useState(codeType)
  useEffect(() => {
    if (
      type != null &&
      values[type]?.value === '' &&
      errors != null &&
      errors.length > 0
    ) {
      const err = errors.filter((e) => e.field === type)
      setOrderErrors(err)
      if (onSubmit) {
        onSubmit({ value: values[type]?.value, success: false })
      }
    }
    if (type != null && values[type]?.value === '') {
      setOrderErrors([])
      if (onSubmit) {
        onSubmit({ value: values[type]?.value, success: false })
      }
    }
  }, [values])

  useEffect(() => {
    if (codeType == null) {
      if (order?.gift_card_code && !order?.coupon_code) {
        setType('coupon_code')
      }
      if (!order?.gift_card_code && order?.coupon_code) {
        setType('gift_card_code')
      }
      if (!order?.gift_card_code && !order?.coupon_code) {
        // TODO: Remove the `as` assertion
        setType('gift_card_or_coupon_code' as OrderCodeType)
      }
    } else {
      setType(codeType)
    }
  }, [order])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    const code =
      type != null && values[type] != null ? values[type].value : undefined
    if (code != null && setGiftCardOrCouponCode != null && type != null) {
      const { success, order } = await setGiftCardOrCouponCode({
        code,
        // TODO: Remove the `as` assertion
        codeType: type as OrderCodeType
      })
      const value = values[type]?.value
      if (onSubmit) {
        onSubmit({
          success,
          value,
          order
        })
      }
      if (success) reset(e)
    }
  }
  if (
    codeType != null &&
    order?.[codeType] != null &&
    order?.[codeType] !== ''
  ) {
    return null
  }
  return (order?.gift_card_code && order?.coupon_code) ||
    order == null ? null : (
    <CouponAndGiftCardFormContext.Provider
      value={{ validation, codeType: type }}
    >
      <form
        ref={ref}
        autoComplete={autoComplete}
        onSubmit={(e) => {
          handleSubmit(e)
        }}
        {...p}
      >
        {children}
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

export default GiftCardOrCouponForm
