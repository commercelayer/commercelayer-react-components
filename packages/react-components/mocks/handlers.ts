/* eslint-disable @typescript-eslint/return-await */
import { HttpResponse, bypass, http } from 'msw'
// import { customerAddresses } from './resources/orders/customer-addresses'
// import { customerOrdersFull } from './resources/orders/customer-orders-full'

export const baseUrl = 'https://*.commercelayer.*/api'

const handlerPaths = [
  `https://*.commercelayer.*/oauth/token`,
  `${baseUrl}/prices*`,
  `${baseUrl}/skus*`,
  `${baseUrl}/sku_options*`,
  `${baseUrl}/orders*`,
  `${baseUrl}/line_items*`,
  `${baseUrl}/line_item_options*`,
  `${baseUrl}/delivery_lead_times*`,
  `${baseUrl}/customer_payment_sources*`,
  `${baseUrl}/in_stock_subscriptions*`,
  `${baseUrl}/customers*`
].map((path: string) => {
  return http.all(path, async ({ request }) => {
    const response = await fetch(bypass(request))
    const realResponse = await response.json()
    return HttpResponse.json(realResponse)
  })
})

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  // http.get(`${baseUrl}/customers*`, async (_req, res, ctx) => {
  //   return await res(ctx.status(200), ctx.json(customerOrdersFull))
  // }),
  http.get(`${baseUrl}/customer_addresses`, async ({ request }) => {
    const response = await fetch(bypass(request))
    const realResponse = await response.json()
    return HttpResponse.json(realResponse)
  }),
  ...handlerPaths
]
