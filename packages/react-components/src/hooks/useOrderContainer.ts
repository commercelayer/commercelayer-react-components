import OrderContext from '#context/OrderContext'
import type {
  createOrder,
  OrderState,
  addToCart
} from '#reducers/OrderReducer'
import { useContext } from 'react'

type TAddToCartParams = Omit<
  Parameters<typeof addToCart>[number],
  | 'buyNowMode'
  | 'state'
  | 'dispatch'
  | 'setLocalOrder'
  | 'errors'
  | 'checkoutUrl'
  | 'persistKey'
  | 'config'
>

type TCreateCartParams = Pick<
  Parameters<typeof createOrder>[number],
  'orderAttributes' | 'orderMetadata'
>

interface TReturnOrder
  extends Omit<
    OrderState,
    'loading' | 'include' | 'includeLoaded' | 'withoutIncludes' | 'orderId'
  > {
  /** Refetch the current order and update the context */
  reloadOrder: () => Promise<OrderState['order']>
  /** Allow to add a SKU or a Bundle to the order stored in the context */
  addToCart: (params: TAddToCartParams) => ReturnType<typeof addToCart>
  /** Allow to create a new order and store it in the OrderContainer context */
  createOrder: (params: TCreateCartParams) => Promise<string | undefined>
}

/**
 * React Hook that provides access to the order context stored in the `<OrderContainer>` component.
 **/
export function useOrderContainer(): TReturnOrder {
  const ctx = useContext(OrderContext)
  if ('order' in ctx) {
    return {
      order: ctx.order,
      reloadOrder: async () => {
        if (ctx?.order?.id) return await ctx?.getOrder(ctx?.order?.id)
        return undefined
      },
      addToCart: async (params) => {
        if (ctx?.addToCart) return await ctx?.addToCart(params)
        return {
          success: false
        }
      },
      createOrder: async (params) => {
        if (ctx?.createOrder) return await ctx?.createOrder(params)
        return undefined
      }
    }
  }
  throw new Error('Cannot use `useOrderContainer` outside of <OrderContainer/>')
}

export default useOrderContainer
