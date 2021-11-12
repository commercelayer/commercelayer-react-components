import { createContext } from 'react'
import {
  addToCart,
  AddToCart,
  OrderState,
  CreateOrder,
  SetGiftCardOrCouponCode,
  RemoveGiftCardOrCouponCode,
  SaveAddressToCustomerAddressBook,
  setOrderErrors,
  createOrder,
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
} from '#reducers/OrderReducer'
import { Order } from '@commercelayer/sdk'

type DefaultContext = {
  createOrder: CreateOrder
  addToCart: AddToCart
  setOrderErrors: typeof setOrderErrors
  setGiftCardOrCouponCode: SetGiftCardOrCouponCode
  removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook
  addResourceToInclude: typeof addResourceToInclude
  getOrder: (id: string) => Promise<void | Order>
} & OrderState

export const defaultOrderContext = {
  addToCart,
  createOrder,
  setOrderErrors,
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
  getOrder: async () => {},
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
