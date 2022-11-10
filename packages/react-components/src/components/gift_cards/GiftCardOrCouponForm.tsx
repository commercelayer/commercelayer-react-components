import { useRapidForm } from 'rapid-form'
import { useContext, useEffect, useRef, useState, ReactNode } from 'react'
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import OrderContext from '#context/OrderContext'
import isEmpty from 'lodash/isEmpty'
import camelCase from 'lodash/camelCase'
import dropWhile from 'lodash/dropWhile'
import has from 'lodash/has'
import { findIndex } from 'lodash'
import { OrderCodeType } from '#reducers/OrderReducer'

type Props = {
  children: ReactNode
  onSubmit?: (response: { success: boolean; value: string }) => void
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

export function GiftCardOrCouponForm(props: Props): JSX.Element | null {
  const { children, autoComplete = 'on', onSubmit, ...p } = props
  const { validation, values, reset } = useRapidForm()
  const [codeType, setCodeType] = useState<OrderCodeType>(
    'gift_card_or_coupon_code'
  )
  const { setGiftCardOrCouponCode, order, errors, setOrderErrors } =
    useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  const inputName = 'gift_card_or_coupon_code'
  useEffect(() => {
    if (
      values[inputName]?.value === '' &&
      findIndex(errors, { field: camelCase(inputName) }) !== -1
    ) {
      const err = dropWhile(errors, (i) => i.field === camelCase(inputName))
      setOrderErrors(err)
      if (onSubmit) {
        onSubmit({ value: values[inputName]?.value, success: false })
      }
    }
    if (values[inputName]?.value === '') {
      setOrderErrors([])
      if (onSubmit) {
        onSubmit({ value: values[inputName]?.value, success: false })
      }
    }
  }, [values])

  useEffect(() => {
    if (order?.gift_card_code && !order?.coupon_code) {
      setCodeType('coupon_code')
    }
    if (!order?.gift_card_code && order?.coupon_code) {
      setCodeType('gift_card_code')
    }
    if (!order?.gift_card_code && !order?.coupon_code) {
      setCodeType('gift_card_or_coupon_code')
    }
  }, [order])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    const code = has(values, inputName) ? values[inputName].value : undefined
    if (code) {
      const { success } = await setGiftCardOrCouponCode({ code, codeType })
      const value = values[inputName]?.value
      if (onSubmit) {
        onSubmit({
          success,
          value
        })
      }
      if (success) reset(e)
    }
  }
  return (order?.gift_card_code && order?.coupon_code) ||
    isEmpty(order) ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ validation, codeType }}>
      <form
        ref={ref}
        autoComplete={autoComplete}
        onSubmit={(e) => {
          void handleSubmit(e)
        }}
        {...p}
      >
        {children}
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

export default GiftCardOrCouponForm
