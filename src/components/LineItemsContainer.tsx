import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext
} from 'react'
import lineItemReducer, {
  lineItemInitialState,
  updateLineItem,
  LineItemState,
  deleteLineItem,
  getLineItems
} from '../reducers/LineItemReducer'
import OrderContext from '../context/OrderContext'
import LineItemContext from '../context/LineItemContext'
import CommerceLayerContext from '../context/CommerceLayerContext'
import _ from 'lodash'
import PropTypes, { InferProps } from 'prop-types'
import { PTLoader } from '../@types'

const LItemsCProps = {
  children: PropTypes.node.isRequired,
  filters: PropTypes.object,
  loader: PTLoader
}

export type LineItemsContainer = InferProps<typeof LItemsCProps>

const LineItemsContainer: FunctionComponent<LineItemsContainer> = props => {
  const { children, filters, loader } = props
  const { order, getOrder, orderId } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  useEffect(() => {
    if (!_.isEmpty(order)) {
      getLineItems({
        order,
        dispatch,
        config,
        filters
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
    loader,
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
      {state.loading ? loader : children}
    </LineItemContext.Provider>
  )
}

LineItemsContainer.propTypes = LItemsCProps

LineItemsContainer.defaultProps = {
  filters: {},
  loader: 'Loading...'
}

export default LineItemsContainer
