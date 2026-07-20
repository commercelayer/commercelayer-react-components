import { type JSX, useContext, useEffect, useState } from "react"
import OrderContext from "#context/OrderContext"
import type { BaseOrderPriceOwnProps } from "#typings"
import getAmount from "#utils/getAmount"
import { isEmpty } from "#utils/isEmpty"
import Parent from "./Parent"

export type BaseOrderPriceProps = BaseOrderPriceOwnProps &
  Omit<JSX.IntrinsicElements["span"], "children" | "ref">

export function BaseOrderPrice(props: BaseOrderPriceProps): JSX.Element {
  const { format = "formatted", base, type, children, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState("")
  const [cents, setCents] = useState(0)
  useEffect(() => {
    const p = getAmount({
      base,
      type,
      format: format as string,
      obj: order || {},
    })
    const c = getAmount<number>({
      base,
      type,
      format: "cents",
      obj: order || {},
    })
    setPrice(p)
    setCents(c)
    return (): void => {
      if (isEmpty(order)) {
        setPrice("")
      }
    }
  }, [order, type, format, base])
  const parentProps = {
    priceCents: cents,
    price,
    ...p,
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : <span {...p}>{price}</span>
}

export default BaseOrderPrice
