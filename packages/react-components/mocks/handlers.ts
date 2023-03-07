import { rest } from 'msw'
import { customerAddresses } from './resources/orders/customer-addresses'
import { customerOrdersFull } from './resources/orders/customer-orders-full'

export const baseUrl = 'https://*.commercelayer.*/api'

const handlerPaths = [
  `${baseUrl}/prices*`,
  `${baseUrl}/skus*`,
  `${baseUrl}/sku_options*`,
  `${baseUrl}/orders*`,
  `${baseUrl}/line_items*`,
  `${baseUrl}/line_item_options*`,
  `${baseUrl}/delivery_lead_times*`,
  `${baseUrl}/customer_payment_sources*`
].map((path: string) => {
  return rest.all(path, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(
      ctx.status(originalResponse.status),
      ctx.json(originalResData)
    )
  })
})

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  rest.get(`${baseUrl}/customers*`, async (_req, res, ctx) => {
    return await res(ctx.status(200), ctx.json(customerOrdersFull))
  }),
  rest.get(`${baseUrl}/customer_addresses`, async (_req, res, ctx) => {
    return await res(ctx.status(200), ctx.json(customerAddresses))
  }),
  ...handlerPaths
]
