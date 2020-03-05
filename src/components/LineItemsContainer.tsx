import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import lineItemReducer, {
  lineItemInitialState,
  updateLineItem,
  LineItemState,
  deleteLineItem
} from '../reducers/LineItemReducer'
import OrderContext from '../context/OrderContext'
import LineItemContext from '../context/LineItemContext'
import CommerceLayerContext from '../context/CommerceLayerContext'
import _ from 'lodash'
import PropTypes from 'prop-types'

export interface LineItemsContainer {
  children?: ReactNode
  // TODO add perPage and its integration
}

const LineItemsContainer: FunctionComponent<LineItemsContainer> = props => {
  const { children } = props
  const { order, getOrder, orderId } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  useEffect(() => {
    if (!_.isEmpty(order)) {
      const lItems = order?.lineItems().toArray()
      dispatch({
        type: 'setLineItems',
        payload: { lineItems: lItems }
      })
    }
    return (): void => {
      dispatch({
        type: 'setLineItems',
        payload: { lineItems: [] }
      })
    }
  }, [order])
  const lineItemValue: LineItemState = {
    ...state,
    updateLineItem: (lineItemId, quantity = 1) =>
      updateLineItem({
        lineItemId,
        quantity,
        dispatch,
        config,
        getOrder,
        orderId,
        errors: state.errors
      }),
    deleteLineItem: lineItemId =>
      deleteLineItem({
        lineItemId,
        dispatch,
        config,
        getOrder,
        orderId,
        errors: state.errors
      })
  }
  return (
    <LineItemContext.Provider value={lineItemValue}>
      {children}
    </LineItemContext.Provider>
  )
}

LineItemsContainer.propTypes = {
  children: PropTypes.node
}

export default LineItemsContainer
