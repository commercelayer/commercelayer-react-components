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

type DefaultContext = {
  createOrder: CreateOrder
  addToCart: AddToCart
  setOrderErrors: typeof setOrderErrors
  setGiftCardOrCouponCode: SetGiftCardOrCouponCode
  removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook
  addResourceToInclude: typeof addResourceToInclude
} & OrderState

export const defaultOrderContext = {
  addToCart,
  createOrder,
  setOrderErrors,
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
