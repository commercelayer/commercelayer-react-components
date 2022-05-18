import {
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
} from '#reducers/LineItemReducer'
import OrderContext from '#context/OrderContext'
import LineItemContext, { LineItemContextValue } from '#context/LineItemContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
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
  const {
    order,
    addResourceToInclude,
    include,
    orderId,
    getOrder,
    includeLoaded,
  } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(lineItemReducer, lineItemInitialState)
  useEffect(() => {
    if (!include?.includes('line_items.line_item_options.sku_option')) {
      addResourceToInclude({
        newResource: ['line_items.line_item_options.sku_option'],
      })
    } else if (!includeLoaded?.['line_items.line_item_options.sku_option']) {
      addResourceToInclude({
        newResourceLoaded: {
          'line_items.line_item_options.sku_option': true,
        },
      })
    }
    if (!include?.includes('line_items.item')) {
      addResourceToInclude({
        newResource: ['line_items.item'],
      })
    } else if (!includeLoaded?.['line_items.item']) {
      addResourceToInclude({
        newResourceLoaded: {
          'line_items.item': true,
        },
      })
    }
  }, [include, includeLoaded])
  useEffect(() => {
    if (order?.line_items && order.line_items.length > 0) {
      dispatch({
        type: 'setLineItems',
        payload: { lineItems: order.line_items },
      })
    }
  }, [order])

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
