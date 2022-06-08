import { FunctionComponent, useState, useEffect, useContext } from 'react'
import getAmount from '#utils/getAmount'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { BaseAmountComponent } from '#typings/index'

const propTypes = components.PaymentMethodPrice.propTypes
const displayName = components.PaymentMethodPrice.displayName

type Props = {
  type?: 'amount'
  labelFree?: string
}

export type PaymentMethodPriceProps = BaseAmountComponent & Props

const PaymentMethodPrice: FunctionComponent<PaymentMethodPriceProps> = (
  props
) => {
  const {
    format = 'formatted',
    type = 'amount',
    labelFree = 'Free',
    ...p
  } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const [price, setPrice] = useState('')
  const [priceCents, setPriceCents] = useState(0)
  useEffect(() => {
    if (payment) {
      const p = getAmount({ base: 'price', type, format, obj: payment })
      setPrice(p)
      const c = getAmount<number>({
        base: 'price',
        type,
        format: 'cents',
        obj: payment,
      })
      setPriceCents(c)
    }
    return (): void => {
      setPrice('')
      setPriceCents(0)
    }
  }, [payment])
  const parentProps = {
    labelFree,
    price,
    priceCents,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{priceCents === 0 ? labelFree : price}</span>
  )
}

PaymentMethodPrice.propTypes = propTypes
PaymentMethodPrice.displayName = displayName

export default PaymentMethodPrice
