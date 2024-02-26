import { http } from 'msw'

const restPost = http.post(
  `https://mock.localhost/api/adjustments`,
  async (req, res, ctx) => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          res(
            ctx.status(200),
            ctx.json({
              data: {
                id: 'eqJGhgEeBb',
                type: 'adjustments',
                links: {
                  self: 'https://mock.localhost/api/adjustments/eqJGhgEeBb'
                },
                attributes: {
                  name: 'Manual adjustment',
                  currency_code: 'EUR',
                  amount_cents: -100,
                  amount_float: -1.0,
                  formatted_amount: '-€1,00',
                  created_at: '2023-08-23T15:59:30.059Z',
                  updated_at: '2023-08-23T15:59:30.059Z',
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

export default [restPost]
