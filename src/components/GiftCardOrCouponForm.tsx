import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
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
import { FunctionChildren } from '#typings/index'
import Parent from './utils/Parent'

// const propTypes = components.GiftCardOrCouponForm.propTypes

type GiftCardOrCouponFormChildrenProps = FunctionChildren<
  Omit<GiftCardOrCouponFormProps, 'children'> & {
    codeType?: OrderCodeType
  }
>

type GiftCardOrCouponFormProps = {
  children: GiftCardOrCouponFormChildrenProps
  onSubmit?: (response: { success: boolean }) => void
} & Omit<JSX.IntrinsicElements['form'], 'onSubmit'>

const GiftCardOrCouponForm: FunctionComponent<GiftCardOrCouponFormProps> = (
  props
) => {
  const { children, autoComplete = 'on', onSubmit, ...p } = props
  const { validation, values } = useRapidForm()
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
      setOrderErrors({ errors: err })
      onSubmit && onSubmit({ success: true })
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
      onSubmit && onSubmit({ success })
      success && e.target.reset()
    }
  }
  const parentProps = { ...p, codeType }

  return (order?.gift_card_code && order?.coupon_code) ||
    isEmpty(order) ? null : (
    <CouponAndGiftCardFormContext.Provider value={{ validation }}>
      <form
        ref={ref}
        autoComplete={autoComplete}
        onSubmit={handleSubmit}
        {...p}
      >
        <Parent {...parentProps}>{children}</Parent>
      </form>
    </CouponAndGiftCardFormContext.Provider>
  )
}

export default GiftCardOrCouponForm
