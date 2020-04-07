import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import Parent from './utils/Parent'
import getLineItemsCount from '../utils/getLineItemsCount'
import _ from 'lodash'
import LineItemContext from '../context/LineItemContext'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.LineItemsCount.propTypes
const displayName = components.LineItemsCount.displayName

export type LineItemsCountProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const LineItemsCount: FunctionComponent<LineItemsCountProps> = (props) => {
  const { children, ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const [quantity, setQuantity] = useState(0)
  useEffect(() => {
    if (!_.isEmpty(lineItems)) {
      const qty = getLineItemsCount(lineItems || [])
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [lineItems])
  const parentProps = {
    quantity,
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
