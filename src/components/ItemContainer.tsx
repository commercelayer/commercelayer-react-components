import React, {
  FunctionComponent,
  useReducer,
  useEffect,
  ReactNode,
} from 'react'
import ItemContext, {
  initialItemContext,
  InitItemContext,
} from '../context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItemState,
  Items,
  ItemQuantity,
  ItemOptions,
  CustomLineItems,
  CustomLineItem,
} from '../reducers/ItemReducer'
import { BFSetStateContainer } from '../@types/index'
import { ItemPrices } from '../reducers/ItemReducer'
import components from '../config/components'

const propTypes = components.ItemContainer.propTypes
const displayName = components.ItemContainer.displayName

type ItemContainerProps = {
  children: ReactNode
  skuCode?: string
  lineItem?: {
    name: string
    imageUrl?: string
  }
}

const ItemContainer: FunctionComponent<ItemContainerProps> = (props) => {
  const { children, skuCode, lineItem } = props
  const [state, dispatch] = useReducer(itemReducer, itemInitialState)
  useEffect(() => {
    if (skuCode) {
      setItemState(skuCode, { type: 'setSkuCode', key: 'skuCode' }, dispatch)
    }
    if (lineItem) {
      setItemState(
        lineItem as CustomLineItem,
        { type: 'setCustomLineItem', key: 'lineItem' },
        dispatch
      )
    }
  }, [])
  const setItems: BFSetStateContainer<Items> = (items) =>
    setItemState(items, { type: 'setItems', key: 'items' }, dispatch)
  const setItem: BFSetStateContainer<Items> = (item) =>
    setItemState(item, { type: 'setItem', key: 'item' }, dispatch)
  const setQuantity: BFSetStateContainer<ItemQuantity> = (item) =>
    setItemState(item, { type: 'setQuantity', key: 'quantity' }, dispatch)
  const setOption: BFSetStateContainer<ItemOptions> = (item) =>
    setItemState(item, { type: 'setOption', key: 'option' }, dispatch)
  const setPrices: BFSetStateContainer<ItemPrices> = (item) =>
    setItemState(item, { type: 'setPrices', key: 'prices' }, dispatch)
  const setCustomLineItems: BFSetStateContainer<CustomLineItems> = (item) =>
    setItemState(
      item,
      { type: 'setCustomLineItems', key: 'lineItems' },
      dispatch
    )
  const itemValue = {
    ...initialItemContext,
    ...state,
    setItems,
    setItem,
    setQuantity,
    setOption,
    setPrices,
    setCustomLineItems,
  } as InitItemContext
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

ItemContainer.propTypes = propTypes
ItemContainer.displayName = displayName

export default ItemContainer
