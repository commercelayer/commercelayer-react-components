import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import Parent from './utils/Parent'
import getLineItemsCount from '#utils/getLineItemsCount'
import { isEmpty } from 'lodash'
import LineItemContext from '#context/LineItemContext'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'

const propTypes = components.LineItemsEmpty.propTypes
const displayName = components.LineItemsEmpty.displayName

export type LineItemsCountType = FunctionChildren<
  Omit<LineItemsCountProps, 'children'> & {
    quantity: number
    text: string
  }
>

type LineItemsCountProps = {
  children?: LineItemsCountType
  text?: string
} & JSX.IntrinsicElements['span']

const LineItemsEmpty: FunctionComponent<LineItemsCountProps> = (props) => {
  const { children, text = 'Your shopping bag is empty', ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const [quantity, setQuantity] = useState(0)
  const emptyText = quantity === 0 ? <span {...p}>{text}</span> : null
  useEffect(() => {
    if (!isEmpty(lineItems)) {
      const qty = getLineItemsCount({ lineItems: lineItems || [] })
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [lineItems])
  const parentProps = {
    quantity,
    text,
    ...p,
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : emptyText
}

LineItemsEmpty.propTypes = propTypes
LineItemsEmpty.displayName = displayName

export default LineItemsEmpty
