import { useRapidForm } from 'rapid-form'
import { useContext, useEffect, useRef } from 'react'
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
  const {
    children,
    codeType = 'gift_card_or_coupon_code',
    autoComplete = 'on',
    onSubmit,
    ...p
  } = props
  const { validation, values, reset } = useRapidForm()
  const { setGiftCardOrCouponCode, order, errors, setOrderErrors } =
    useContext(OrderContext)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (values[codeType]?.value === '' && errors != null && errors.length > 0) {
      const err = errors.filter((e) => e.field === codeType)
      setOrderErrors(err)
      if (onSubmit) {
        onSubmit({ value: values[codeType]?.value, success: false })
      }
    }
    if (values[codeType]?.value === '') {
      setOrderErrors([])
      if (onSubmit) {
        onSubmit({ value: values[codeType]?.value, success: false })
      }
    }
  }, [values])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    const code = values[codeType] != null ? values[codeType].value : undefined
    if (code != null && setGiftCardOrCouponCode != null && codeType != null) {
      const { success, order } = await setGiftCardOrCouponCode({
        code,
        // TODO: Remove the `as` assertion
        codeType: codeType as OrderCodeType
      })
      const value = values[codeType]?.value
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
  return order?.[codeType as OrderCodeType] || order == null ? null : (
    <CouponAndGiftCardFormContext.Provider
      value={{ validation, codeType: codeType as OrderCodeType }}
    >
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
