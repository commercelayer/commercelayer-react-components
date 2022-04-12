import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import OrderContext from '#context/OrderContext'
import isEmpty from 'lodash/isEmpty'
import components from '#config/components'
import camelCase from 'lodash/camelCase'
import dropWhile from 'lodash/dropWhile'
import has from 'lodash/has'
import { findIndex } from 'lodash'
import { BaseError } from '#typings/errors'
import { OrderCodeType } from '#reducers/OrderReducer'

const propTypes = components.GiftCardOrCouponForm.propTypes

type GiftCardOrCouponFormProps = {
  children: ReactNode
  onSubmit?: (response: { success: boolean; value: string }) => void
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const GiftCardOrCouponForm: FunctionComponent<GiftCardOrCouponFormProps> = (
  props
) => {
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
      const err = dropWhile(
        errors,
        (i) => i.field === camelCase(inputName)
      ) as BaseError[]
      setOrderErrors(err)
      onSubmit && onSubmit({ value: values[inputName]?.value, success: false })
    }
    if (values[inputName]?.value === '') {
      setOrderErrors([])
      onSubmit && onSubmit({ value: values[inputName]?.value, success: false })
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

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = has(values, inputName) ? values[inputName].value : undefined
    if (code) {
      const { success } = await setGiftCardOrCouponCode({ code, codeType })
      const value = values[inputName]?.value
      onSubmit &&
        onSubmit({
          success,
          value,
        })
      success && reset(e)
    }
  }
  return (order?.gift_card_code && order?.coupon_code) ||
    isEmpty(order) ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ validation, codeType }}>
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
