import React, { FunctionComponent, useReducer } from 'react'
import ItemContext, { initialItemContext } from '../context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItemState,
  Items,
  ItemQuantity,
  ItemOptions
} from '../reducers/ItemReducer'
import PropTypes, { InferProps } from 'prop-types'
import { BFSetStateContainer } from '../@types/index'
import { ItemPrices } from '../reducers/ItemReducer'

const ICProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string
}

export type ItemContainerProps = InferProps<typeof ICProps>

const ItemContainer: FunctionComponent<ItemContainerProps> = props => {
  // TODO add skuCode to workflow
  const { children } = props
  const [state, dispatch] = useReducer(itemReducer, itemInitialState)
  const setItems: BFSetStateContainer<Items> = items =>
    setItemState(items, { type: 'setItems', key: 'items' }, dispatch)
  const setItem: BFSetStateContainer<Items> = item =>
    setItemState(item, { type: 'setItem', key: 'item' }, dispatch)
  const setQuantity: BFSetStateContainer<ItemQuantity> = item =>
    setItemState(item, { type: 'setQuantity', key: 'quantity' }, dispatch)
  const setOption: BFSetStateContainer<ItemOptions> = item =>
    setItemState(item, { type: 'setOption', key: 'option' }, dispatch)
  const setPrices: BFSetStateContainer<ItemPrices> = item =>
    setItemState(item, { type: 'setPrices', key: 'prices' }, dispatch)
  const itemValue = {
    ...initialItemContext,
    ...state,
    setItems,
    setItem,
    setQuantity,
    setOption,
    setPrices
  }
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

ItemContainer.propTypes = ICProps

export default ItemContainer
