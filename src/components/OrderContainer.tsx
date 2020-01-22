import React, { useEffect, useState, FunctionComponent } from 'react'
import Parent from './utils/Parent'
import { getLocalOrder, setLocalOrder } from '../utils/localStorage'
import {
  Order,
  LineItem,
  Sku,
  Item,
  OrderCollection
} from '@commercelayer/js-sdk'

export interface OrderContainerActions {
  setOrderId?: (orderId: string) => void
  getOrder?: (orderId: string) => void
  orderId?: string
  order?: OrderCollection
}

export interface OrderContainerProps {
  id?: string
  persistKey: string
  children: any
  accessToken?: string
}
// TODO: refactor with useReducer
const OrderContainer: FunctionComponent<OrderContainerProps> = props => {
  const { children, accessToken, persistKey } = props
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  console.log('--- ORDER ---', order)
  const createOrder = async () => {
    if (orderId) return orderId
    const o = await Order.create({})
    if (o.id) {
      setOrderId(o.id)
      setLocalOrder(persistKey, o.id)
      setOrder(o)
      return o.id
    }
  }
  const getOrder = async (id: string) => {
    const o = await Order.includes('line_items').find(id)
    if (o) setOrder(o)
  }
  const addToCart = async (
    skuCode: string,
    skuId: string,
    quantity: number = 1
  ) => {
    const id = await createOrder()
    if (id) {
      const order = Order.build({ id })
      const item = Sku.build({ id: skuId })
      const attrs = {
        order,
        item,
        skuCode,
        quantity,
        _update_quantity: 1
      }
      LineItem.create(attrs).then(() => getOrder(id))
    }
  }
  const parentProps = {
    orderId,
    order,
    addToCart,
    getOrder,
    ...props
  }
  useEffect(() => {
    if (accessToken) {
      const localOrder = getLocalOrder(persistKey)
      if (localOrder) {
        setOrderId(localOrder)
        if (!order) {
          getOrder(localOrder)
        }
      }
    }

    return () => {
      setOrderId('')
    }
  }, [accessToken, order])
  return <Parent {...parentProps}>{children}</Parent>
}

export default OrderContainer
