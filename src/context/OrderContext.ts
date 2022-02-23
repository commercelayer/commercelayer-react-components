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
  updateOrder,
  getOrderContext,
} from '#reducers/OrderReducer'

type DefaultContext = {
  createOrder: CreateOrder
  addToCart: AddToCart
  setOrderErrors: (errors: unknown) => void
  setGiftCardOrCouponCode: SetGiftCardOrCouponCode
  removeGiftCardOrCouponCode: RemoveGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook
  addResourceToInclude: typeof addResourceToInclude
  getOrder: getOrderContext
  updateOrder: typeof updateOrder
} & OrderState

export const defaultOrderContext = {
  addToCart,
  createOrder,
  setOrderErrors: () => {
    return
  },
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
  getOrder: async () => {
    return
  },
  updateOrder,
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
