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
  }),
  rest.get(`${baseUrl}/prices*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/skus*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/sku_options*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.post(`${baseUrl}/orders*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/orders*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.post(`${baseUrl}/line_items*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/line_items*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.patch(`${baseUrl}/line_items*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.delete(`${baseUrl}/line_items*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.post(`${baseUrl}/line_item_options*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/line_item_options*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/delivery_lead_times*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  }),
  rest.get(`${baseUrl}/customer_payment_sources*`, async (req, res, ctx) => {
    const originalResponse = await ctx.fetch(req)
    const originalResData = await originalResponse.json()
    return await res(ctx.status(200), ctx.json(originalResData))
  })
]
