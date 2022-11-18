import OrderContext from '#context/OrderContext'
import { type Order } from '@commercelayer/sdk'
import { useContext } from 'react'

export function useOrderContainer(): {
  order?: Order
  reloadOrder: () => Promise<Order | undefined>
} {
  const ctx = useContext(OrderContext)
  if ('order' in ctx) {
    return {
      order: ctx.order,
      reloadOrder: async () => {
        if (ctx?.order?.id) return await ctx?.getOrder(ctx?.order?.id)
        return undefined
      }
    }
  }
  throw new Error('Cannot use `useOrderContainer` outside of <OrderContainer/>')
}

export default useOrderContainer
