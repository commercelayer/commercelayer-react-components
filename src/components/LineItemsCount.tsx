import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect
} from 'react'
import { BaseComponent } from '../@types/index'
import Parent from './utils/Parent'
import getLineItemsCount from '../utils/getLineItemsCount'
import _ from 'lodash'
import { InferProps } from 'prop-types'
import PropTypes from 'prop-types'
import LineItemContext from '../context/LineItemContext'

const LItemsCProps = {
  children: PropTypes.func
}

export type LineItemsCountProps = InferProps<typeof LItemsCProps> &
  BaseComponent

const LineItemsCount: FunctionComponent<LineItemsCountProps> = props => {
  const { children, ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const [quantity, setQuantity] = useState(0)
  useEffect(() => {
    if (!_.isEmpty(lineItems)) {
      const qty = getLineItemsCount(lineItems)
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [lineItems])
  const parentProps = {
    quantity,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

LineItemsCount.propTypes = LItemsCProps

export default LineItemsCount
