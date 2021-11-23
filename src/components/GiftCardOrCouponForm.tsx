import useRapidForm from 'rapid-form'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
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
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = has(values, inputName) ? values[inputName].value : undefined
    if (code) {
      const { success } = await setGiftCardOrCouponCode({ code })
      onSubmit && onSubmit({ success })
      success && e.target.reset()
    }
  }
  return order?.gift_card_or_coupon_code || isEmpty(order) ? null : (
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
