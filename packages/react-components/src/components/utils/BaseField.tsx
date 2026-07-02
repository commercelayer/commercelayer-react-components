import { type FunctionComponent, type JSX, useContext, useEffect, useState } from "react"
import OrderContext from "#context/OrderContext"
import Parent from "./Parent"

type BaseFieldChildren = Omit<BaseFieldProps, "children">

export interface BaseFieldProps extends Omit<JSX.IntrinsicElements["span"], "children" | "ref"> {
  attribute: "number" | "id"
  children?: (props: BaseFieldChildren) => JSX.Element
}

const BaseField: FunctionComponent<BaseFieldProps> = ({ children, attribute, ...p }) => {
  const { order } = useContext(OrderContext)
  const [field, setField] = useState<string | undefined | null>("")
  useEffect(() => {
    if (order && attribute in order) setField(order[attribute])
    return () => {
      setField("")
    }
  }, [order, attribute])
  const parentProps = { attribute: field, ...p }
  return children ? <Parent {...parentProps}>{children}</Parent> : <span {...p}>{field}</span>
}

export default BaseField
