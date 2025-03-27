import { http } from 'msw'

const restPatch = http.patch(
  `https://mock.localhost/api/line_items/:id`,
  async (req, res, ctx) => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(res(ctx.status(200), ctx.body(`Update ${req.params.id}`)))
      }, 1000)
    })
  }
)

const restDelete = http.delete(
  `https://mock.localhost/api/line_items/:id`,
  async (req, res, ctx) => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(res(ctx.status(200), ctx.body(`Removed ${req.params.id}`)))
      }, 1000)
    })
  }
)

const restPost = http.post(
  `https://mock.localhost/api/line_items`,
  async (req, res, ctx) => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          res(
            ctx.status(200),
            ctx.json({
              data: {
                id: 'vrEAtOmRaz',
                type: 'line_items',
                links: {
                  self: 'https://mock.localhost/api/line_items/vrEAtOmRaz'
                },
                attributes: {
                  sku_code: null,
                  bundle_code: null,
                  quantity: 1,
                  currency_code: 'EUR',
                  unit_amount_cents: -100,
                  unit_amount_float: -1.0,
                  formatted_unit_amount: '-€1,00',
                  options_amount_cents: 0,
                  options_amount_float: 0.0,
                  formatted_options_amount: '€0,00',
                  discount_cents: 0,
                  discount_float: 0.0,
                  formatted_discount: '€0,00',
                  total_amount_cents: -100,
                  total_amount_float: -1.0,
                  formatted_total_amount: '-€1,00',
                  tax_amount_cents: 0,
                  tax_amount_float: 0.0,
                  formatted_tax_amount: '€0,00',
                  name: 'Manual adjustment',
                  image_url: null,
                  discount_breakdown: {},
                  tax_rate: 0.0,
                  tax_breakdown: {},
                  item_type: 'adjustments',
                  frequency: null,
                  created_at: '2023-08-23T15:59:30.205Z',
                  updated_at: '2023-08-23T15:59:30.205Z',
                  reference: null,
                  reference_origin: null,
                  metadata: {}
                }
              }
            })
          )
        )
      }, 1000)
    })
  }
)

export default [restPatch, restDelete, restPost]
