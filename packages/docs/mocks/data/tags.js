import { rest } from 'msw'

const mockedTags = Array(15)
  .fill(null)
  .map((item, idx) => ({
    id: Math.random().toString().substring(2, 12),
    type: 'tags',
    attributes: {
      name: `tag-${idx}`,
      created_at: '2023-03-17T14:07:36.604Z',
      updated_at: '2023-03-17T14:07:36.604Z'
    },
    meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
  }))

const customerTags = rest.get(
  `https://mock.localhost/api/customers/NMWYhbGorj/tags`,
  async (req, res, ctx) => {
    return await res(
      ctx.status(200),
      ctx.json({
        data: mockedTags.slice(0, 2),
        meta: { record_count: 2, page_count: 1 }
      })
    )
  }
)

const organizationTags = rest.get(
  `https://mock.localhost/api/tags`,
  async (req, res, ctx) => {
    return await res(
      ctx.status(200),
      ctx.json({
        data: mockedTags,
        meta: { record_count: 100, page_count: 10 }
      })
    )
  }
)

export default [customerTags, organizationTags]
