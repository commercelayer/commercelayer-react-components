import React, {
  useEffect,
  FunctionComponent,
  ReactElement,
  useReducer
} from 'react'
import { LineItem } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import { OrderContainerActions } from './OrderContainer'
import { LineItemProps } from './LineItem'
import lineItemReducer, {
  lineItemInitialState
} from '../reducers/LineItemReducer'

export interface LineItemsContainer extends OrderContainerActions {
  children?: ReactElement<LineItemProps>[] | ReactElement<LineItemProps>
}

const LineItemsContainer: FunctionComponent<LineItemsContainer> = props => {
  const { order, children } = props
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  const updateLineItem = (lineItemId, quantity = 1) => {
    const update = LineItem.find(lineItemId).then((lnIt: any) => {
      return lnIt.update({ quantity })
    })
    update.then(() => props.getOrder(props.orderId))
  }
  const deleteLineItem = lineItemId => {
    const deleteItem = LineItem.find(lineItemId).then(lnI => {
      return lnI.destroy()
    })
    deleteItem.then(() => props.getOrder(props.orderId))
  }
  const parentProps = {
    lineItems: state.lineItems,
    updateLineItem,
    deleteLineItem,
    ...props
  }
  useEffect(() => {
    if (props.order) {
      const lItems = order.lineItems().toArray()
      dispatch({
        type: 'setLineItems',
        lineItems: lItems
      })
    }
    return () => {
      dispatch({
        type: 'setLineItems',
        lineItems: []
      })
    }
  }, [order])
  return <Parent {...parentProps}>{children}</Parent>
}

export default LineItemsContainer
