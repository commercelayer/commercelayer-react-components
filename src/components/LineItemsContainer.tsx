import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
} from 'react'
import lineItemReducer, {
  lineItemInitialState,
  updateLineItem,
  deleteLineItem,
  // getLineItems,
} from '#reducers/LineItemReducer'
import OrderContext from '#context/OrderContext'
import LineItemContext, { LineItemContextValue } from '#context/LineItemContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { isEmpty } from 'lodash'
import components from '#config/components'

const propTypes = components.LineItemsContainer.propTypes
const defaultProps = components.LineItemsContainer.defaultProps
const displayName = components.LineItemsContainer.displayName

type LineItemsContainer = {
  children: ReactNode
  filters?: Record<string, any>
  loader?: ReactNode
}

const LineItemsContainer: FunctionComponent<LineItemsContainer> = (props) => {
  const { children, loader = 'Loading...' } = props
  const { order, addResourceToInclude, include, orderId, getOrder } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  useEffect(() => {
    if (!include?.includes('line_items.line_item_options.sku_option')) {
      addResourceToInclude({
        newResource: 'line_items.line_item_options.sku_option',
        resourcesIncluded: include,
      })
    }
    if (!isEmpty(order) && order?.line_items) {
      dispatch({
        type: 'setLineItems',
        payload: { lineItems: order.line_items },
      })
    }
    return (): void => {
      if (isEmpty(order)) {
        dispatch({
          type: 'setLineItems',
          payload: { lineItems: [] },
        })
      }
    }
  }, [order, include])
  const lineItemValue = {
    ...state,
    loader,
    updateLineItem: (lineItemId, quantity = 1) =>
      updateLineItem({
        lineItemId,
        quantity,
        dispatch,
        config,
        getOrder,
        orderId: orderId as string,
        errors: state.errors,
      }),
    deleteLineItem: (lineItemId) =>
      deleteLineItem({
        lineItemId,
        dispatch,
        config,
        getOrder,
        orderId: orderId as string,
        errors: state.errors,
      }),
  } as LineItemContextValue
  return (
    <LineItemContext.Provider value={lineItemValue}>
      {state.loading ? loader : children}
    </LineItemContext.Provider>
  )
}

LineItemsContainer.propTypes = propTypes
LineItemsContainer.defaultProps = defaultProps
LineItemsContainer.displayName = displayName

export default LineItemsContainer
