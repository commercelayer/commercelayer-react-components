import { createContext } from 'react'
import { Order } from '@commercelayer/sdk'
import {
  addToCart,
  AddToCart,
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
  getOrderContext
} from '#reducers/OrderReducer'
import { BaseError } from '#typings/errors'

interface DefaultContext extends OrderState {
  createOrder: CreateOrder
  addToCart: AddToCart
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
  addToCart,
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
