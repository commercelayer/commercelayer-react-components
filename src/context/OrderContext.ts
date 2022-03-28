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
  setOrder: (order: Order) => void
} & OrderState

export const defaultOrderContext = {
  addToCart,
  createOrder,
  setOrderErrors: () => {
    return
  },
  setOrder: () => {
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
