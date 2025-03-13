import { createContext } from "react"
import type { Order } from "@commercelayer/sdk"
import {
  type OrderState,
  type SaveAddressToCustomerAddressBook,
  createOrder,
  paymentSourceRequest,
  setGiftCardOrCouponCode,
  removeGiftCardOrCouponCode,
  saveAddressToCustomerAddressBook,
  addResourceToInclude,
  updateOrder,
  type getOrderContext,
  type addToCart,
} from "#reducers/OrderReducer"
import type { BaseError } from "#typings/errors"

interface DefaultContext extends OrderState {
  createOrder: typeof createOrder
  addToCart?: typeof addToCart
  setOrderErrors: (errors: BaseError[]) => void
  setGiftCardOrCouponCode?: typeof setGiftCardOrCouponCode
  removeGiftCardOrCouponCode?: typeof removeGiftCardOrCouponCode
  saveAddressToCustomerAddressBook: SaveAddressToCustomerAddressBook
  addResourceToInclude: typeof addResourceToInclude
  getOrder: getOrderContext
  updateOrder: typeof updateOrder
  setOrder: (order: Order) => void
  paymentSourceRequest: typeof paymentSourceRequest
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
  updateOrder,
  paymentSourceRequest,
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
