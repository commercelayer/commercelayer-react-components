import { http, HttpResponse } from 'msw'

const skuListData = {
  id: 'SkuListAbc01',
  type: 'sku_lists',
  links: {
    self: 'https://react-components-store.commercelayer.io/api/sku_lists/SkuListAbc01'
  },
  attributes: {
    name: 'Summer Collection',
    slug: 'summer-collection',
    description: 'Our summer collection SKU list.',
    image_url: null,
    manual: true,
    sku_count: 2,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    reference: null,
    reference_origin: null,
    metadata: {}
  },
  relationships: {
    skus: {
      data: [
        { type: 'skus', id: 'SkuAbc001' },
        { type: 'skus', id: 'SkuAbc002' }
      ]
    }
  },
  meta: { mode: 'test' }
}

const included = [
  {
    id: 'SkuAbc001',
    type: 'skus',
    links: { self: 'https://react-components-store.commercelayer.io/api/skus/SkuAbc001' },
    attributes: {
      code: 'TSHIRTMM000000FFFFFFXLXX',
      name: 'Black T-Shirt XL',
      image_url: 'https://img.commercelayer.io/skus/TSHIRTMM000000FFFFFFXLXX.png'
    },
    relationships: {},
    meta: { mode: 'test' }
  },
  {
    id: 'SkuAbc002',
    type: 'skus',
    links: { self: 'https://react-components-store.commercelayer.io/api/skus/SkuAbc002' },
    attributes: {
      code: 'PANTSMM000000FFFFFFXXXX',
      name: 'Black Pants',
      image_url: 'https://img.commercelayer.io/skus/PANTSMM000000FFFFFFXXXX.png'
    },
    relationships: {},
    meta: { mode: 'test' }
  }
]

export default [
  http.get(
    'https://react-components-store.commercelayer.io/api/sku_lists/:id',
    () => {
      return HttpResponse.json({
        data: skuListData,
        included
      })
    }
  )
]
