import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import Parent from './utils/Parent'
import getLineItemsCount, { TypeAccepted } from '#utils/getLineItemsCount'
import { isEmpty } from 'lodash'
import LineItemContext from '#context/LineItemContext'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'

const propTypes = components.LineItemsCount.propTypes
const displayName = components.LineItemsCount.displayName

type LineItemsCountChildrenProps = FunctionChildren<
  Omit<LineItemsCountProps, 'children'> & {
    quantity: number
  }
>

type LineItemsCountProps = {
  children?: LineItemsCountChildrenProps
  typeAccepted?: TypeAccepted[]
} & JSX.IntrinsicElements['span']

const LineItemsCount: FunctionComponent<LineItemsCountProps> = (props) => {
  const { children, typeAccepted, ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const [quantity, setQuantity] = useState(0)
  useEffect(() => {
    if (!isEmpty(lineItems)) {
      const qty = getLineItemsCount({
        lineItems: lineItems || [],
        typeAccepted,
      })
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [lineItems, typeAccepted])
  const parentProps = {
    quantity,
    typeAccepted,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

LineItemsCount.propTypes = propTypes
LineItemsCount.displayName = displayName

export default LineItemsCount
