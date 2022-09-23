import { useReducer, useEffect, ReactNode } from 'react'
import ItemContext, {
  initialItemContext,
  InitItemContext
} from '#context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItemState,
  Items,
  ItemQuantity,
  ItemOptions,
  CustomLineItems,
  CustomLineItem,
  ItemPrices
} from '#reducers/ItemReducer'
import { BFSetStateContainer } from '#typings'

interface Props {
  children: ReactNode
  skuCode?: string | null
  lineItem?: {
    name: string
    imageUrl?: string | null
  } | null
}

export function ItemContainer(props: Props): JSX.Element {
  const { children, skuCode, lineItem } = props
  const [state, dispatch] = useReducer(itemReducer, itemInitialState)
  useEffect(() => {
    const code = skuCode
    if (code) {
      setItemState(code, { type: 'setSkuCode', key: 'skuCode' }, dispatch)
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
  const setSkuCode: BFSetStateContainer<string> = (code) =>
    setItemState(code, { type: 'setSkuCode', key: 'skuCode' }, dispatch)
  const itemValue: InitItemContext = {
    ...initialItemContext,
    ...state,
    setItems,
    setItem,
    setQuantity,
    setOption,
    setPrices,
    setCustomLineItems,
    setSkuCode
  }
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

export default ItemContainer
