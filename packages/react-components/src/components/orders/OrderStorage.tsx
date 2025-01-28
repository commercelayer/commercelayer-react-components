import type { ReactNode, JSX } from 'react';
import OrderStorageContext from '#context/OrderStorageContext'
import {
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder
} from '#utils/localStorage'

interface Props {
  children: ReactNode
  /**
   * The key used to persist the order id in the browser local storage.
   */
  persistKey: string
  /**
   * Removes the saved order id from the local storage when order is placed.
   * @default true
   */
  clearWhenPlaced?: boolean
}

/**
 * This component handle the persistence of the order id in the browser local storage.
 * When adding a product into the cart and the order does not exist yet, in will be created by the `OrderContainer` and
 * the order id will then be automatically saved in the local storage using `OrderStorage` context.
 * In this way on page refresh or components remounting, the `OrderContainer` will be able to load the order getting the id from this context.
 *
 * By default, the localStorage key will be deleted once the order has been placed, but you can disable this behavior via `clearWhenPlaced` prop.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<CommerceLayer>` component. <br />
 * </span>
 *
 * <span title="Children" type="info">
 * `<OrderContainer>`,
 * </span>
 */
export function OrderStorage(props: Props): JSX.Element {
  const { children, clearWhenPlaced = true, ...p } = props
  return (
    <OrderStorageContext.Provider
      value={{
        ...p,
        setLocalOrder,
        getLocalOrder,
        deleteLocalOrder,
        clearWhenPlaced
      }}
    >
      {children}
    </OrderStorageContext.Provider>
  )
}

export default OrderStorage
