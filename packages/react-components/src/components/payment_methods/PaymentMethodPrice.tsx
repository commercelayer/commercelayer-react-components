import { useState, useEffect, type JSX } from 'react';
import getAmount from '#utils/getAmount'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components/utils/Parent'
import type { BaseAmountComponent } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'

interface Props extends BaseAmountComponent {
  type?: 'amount'
  labelFree?: string
}

export function PaymentMethodPrice(props: Props): JSX.Element {
  const {
    format = 'formatted',
    type = 'amount',
    labelFree = 'Free',
    ...p
  } = props
  const { payment } = useCustomContext({
    context: PaymentMethodChildrenContext,
    contextComponentName: 'PaymentMethod',
    currentComponentName: 'PaymentMethodPrice',
    key: 'payment'
  })
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
        obj: payment
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
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{priceCents === 0 ? labelFree : price}</span>
  )
}

export default PaymentMethodPrice
