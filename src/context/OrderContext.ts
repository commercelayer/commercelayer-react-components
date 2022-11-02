import { createContext } from 'react'
import { Order } from '@commercelayer/sdk'
import {
  OrderState,
  CreateOrder,
  SetGiftCardOrCouponCode,
  RemoveGiftCardOrCouponCode,
  SaveAddressToCustomerAddressBook,
  createOrder,
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
  updateOrder,
  getOrderContext,
  addToCart
} from '#reducers/OrderReducer'
import { BaseError } from '#typings/errors'

interface DefaultContext extends OrderState {
  createOrder: CreateOrder
  addToCart?: typeof addToCart
  setOrderErrors: (errors: BaseError[]) => void
  setGiftCardOrCouponCode: SetGiftCardOrCouponCode
  removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook
  addResourceToInclude: typeof addResourceToInclude
  getOrder: getOrderContext
  updateOrder: typeof updateOrder
  setOrder: (order: Order) => void
}

export const defaultOrderContext = {
  createOrder,
  setOrderErrors: () => {},
  setOrder: () => {},
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
  getOrder: async () => undefined,
  updateOrder
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
