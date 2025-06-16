import type { ReactNode, JSX } from "react"
import Parent from "#components/utils/Parent"
import type { ChildrenFunction } from "#typings/index"
// import { useState, useEffect, useContext } from "react"
// import OrderContext from "#context/OrderContext"

interface ChildrenProps extends Omit<Props, "children"> {}

interface Props extends Omit<JSX.IntrinsicElements["button"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
}

export function GiftCardOrCouponSubmit(props: Props): JSX.Element {
  const { children, label = "Submit", ...p } = props
  // const [disabled, setDisabled] = useState(false)
  // const { order } = useContext(OrderContext)
  // useEffect(() => {
  //   console.log("GiftCardOrCouponSubmit: useEffect triggered", { order })
  //   if (order?.payment_source?.id != null) {
  //     /**
  //      * If the order has a payment source ID, it means that the user has already
  //      * entered their payment information and the user cannot add a gift card or coupon
  //      * code at this point.
  //      */
  //     setDisabled(true)
  //     console.log(
  //       "GiftCardOrCouponSubmit: The order has a payment source ID, disabling the button.",
  //     )
  //   }
  //   return () => {
  //     setDisabled(false)
  //   }
  // }, [order?.payment_source?.id])
  // p.disabled = disabled
  const parentProps = {
    ...p,
    label,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="submit" {...p}>
      {label}
    </button>
  )
}

export default GiftCardOrCouponSubmit
