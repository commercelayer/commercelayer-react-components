import { rest } from 'msw'
import { customerAddresses } from './resources/orders/customer-addresses'
import { customerOrdersFull } from './resources/orders/customer-orders-full'

export const baseUrl = 'https://*.commercelayer.*/api'

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  rest.get(`${baseUrl}/customers*`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(customerOrdersFull))
  }),
  rest.get(`${baseUrl}/customer_addresses`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(customerAddresses))
  })
]
