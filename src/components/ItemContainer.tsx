import React, { FunctionComponent, useReducer } from 'react'
import ItemContext from '../context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItemState
} from '../reducers/ItemReducer'
import { ItemState } from '../reducers/ItemReducer'
import PropTypes, { InferProps } from 'prop-types'

const ICProps = {
  children: PropTypes.node.isRequired,
  skuCode: PropTypes.string
}

export type ItemContainerProps = InferProps<typeof ICProps>

const ItemContainer: FunctionComponent<ItemContainerProps> = props => {
  // TODO add skuCode to workflow
  const { children } = props
  const [state, dispatch] = useReducer(itemReducer, itemInitialState)
  const itemValue: ItemState = {
    ...state,
    setItems: items =>
      setItemState(items, { type: 'setItems', key: 'items' }, dispatch),
    setItem: item =>
      setItemState(item, { type: 'setItem', key: 'item' }, dispatch),
    setQuantity: item =>
      setItemState(item, { type: 'setQuantity', key: 'quantity' }, dispatch),
    setOption: item =>
      setItemState(item, { type: 'setOption', key: 'option' }, dispatch)
  }
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

ItemContainer.propTypes = ICProps

export default ItemContainer
