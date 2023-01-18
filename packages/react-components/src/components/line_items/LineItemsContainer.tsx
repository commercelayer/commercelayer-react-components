import { useEffect, useReducer, useContext } from 'react'
import lineItemReducer, {
  lineItemInitialState,
  updateLineItem,
  deleteLineItem
} from '#reducers/LineItemReducer'
import OrderContext from '#context/OrderContext'
import LineItemContext, { LineItemContextValue } from '#context/LineItemContext'
import CommerceLayerContext from '#context/CommerceLayerContext'

interface Props {
  children: JSX.Element[] | JSX.Element
  filters?: Record<string, any>
  loader?: JSX.Element
}

export function LineItemsContainer(props: Props): JSX.Element {
  const { children, loader = 'Loading...' } = props
  const {
    order,
    addResourceToInclude,
    include,
    orderId,
    getOrder,
    includeLoaded
  } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  useEffect(() => {
    if (!include?.includes('line_items.line_item_options.sku_option')) {
      addResourceToInclude({
        newResource: ['line_items.line_item_options.sku_option']
      })
    } else if (!includeLoaded?.['line_items.line_item_options.sku_option']) {
      addResourceToInclude({
        newResourceLoaded: {
          'line_items.line_item_options.sku_option': true
        }
      })
    }
    if (!include?.includes('line_items.item')) {
      addResourceToInclude({
        newResource: ['line_items.item']
      })
    } else if (!includeLoaded?.['line_items.item']) {
      addResourceToInclude({
        newResourceLoaded: {
          'line_items.item': true
        }
      })
    }
  }, [include, includeLoaded])
  useEffect(() => {
    if (order?.line_items) {
      dispatch({
        type: 'setLineItems',
        payload: { lineItems: order.line_items }
      })
    }
  }, [order?.line_items])

  const lineItemValue: LineItemContextValue = {
    ...state,
    loader,
    updateLineItem: async (lineItemId, quantity = 1) =>
      await updateLineItem({
        lineItemId,
        quantity,
        dispatch,
        config,
        getOrder,
        orderId: orderId as string,
        errors: state.errors
      }),
    deleteLineItem: async (lineItemId) =>
      await deleteLineItem({
        lineItemId,
        dispatch,
        config,
        getOrder,
        orderId: orderId as string,
        errors: state.errors
      })
  }
  return (
    <LineItemContext.Provider value={lineItemValue}>
      {state.loading ? loader : children}
    </LineItemContext.Provider>
  )
}

export default LineItemsContainer
