import type { Order } from "@commercelayer/sdk"
import { createContext } from "react"
import {
  addResourceToInclude,
  type addToCart,
  createOrder,
  getOrderByFields,
  type getOrderContext,
  type OrderState,
  paymentSourceRequest,
  removeGiftCardOrCouponCode,
  type SaveAddressToCustomerAddressBook,
  saveAddressToCustomerAddressBook,
  setGiftCardOrCouponCode,
  updateOrder,
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
  /** Refetches the current order together with its line items. */
  reloadOrder?: () => Promise<undefined | Order>
  updateOrder: typeof updateOrder
  setOrder: (order: Order) => void
  paymentSourceRequest: typeof paymentSourceRequest
  getOrderByFields: typeof getOrderByFields
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
  getOrderByFields,
}

const OrderContext = createContext<DefaultContext>(defaultOrderContext)

export default OrderContext
