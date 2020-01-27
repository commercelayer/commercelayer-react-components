import React, {
  useEffect,
  FunctionComponent,
  ReactElement,
  useReducer,
  useContext
} from 'react'
import { LineItem } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import { OrderContainerActions } from './OrderContainer'
import { LineItemProps } from './LineItem'
import lineItemReducer, {
  lineItemInitialState
} from '../reducers/LineItemReducer'
import OrderContext from './context/OrderContext'
import LineItemContext from './context/LineItemContext'

export interface LineItemsContainer extends OrderContainerActions {
  children?: ReactElement<LineItemProps>[] | ReactElement<LineItemProps>
}

const LineItemsContainer: FunctionComponent<LineItemsContainer> = props => {
  const { children } = props
  const { order, getOrder, orderId } = useContext(OrderContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  const updateLineItem = (lineItemId, quantity = 1) => {
    const update = LineItem.find(lineItemId).then((lnIt: any) => {
      return lnIt.update({ quantity })
    })
    update.then(() => getOrder(orderId))
  }
  const deleteLineItem = lineItemId => {
    const deleteItem = LineItem.find(lineItemId).then(lnI => {
      return lnI.destroy()
    })
    deleteItem.then(() => getOrder(orderId))
  }
  console.log('Line item container ==> order', order)
  useEffect(() => {
    if (order) {
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
  const lineItemValue = {
    lineItems: state.lineItems,
    updateLineItem,
    deleteLineItem
  }
  return (
    <LineItemContext.Provider value={lineItemValue}>
      {children}
    </LineItemContext.Provider>
  )
}

export default LineItemsContainer
