import { http, HttpResponse } from "msw"

const BASE = "https://react-components-store.commercelayer.io"

const makeDeliveryLeadTime = (min, max, shippingMethod) => ({
  min,
  max,
  shipping_method: shippingMethod,
})

const standardShipping = {
  name: "Standard Shipping",
  reference: "standard",
  price_amount_cents: 500,
  free_over_amount_cents: null,
  formatted_price_amount: "$5.00",
  formatted_free_over_amount: null,
}

const expressShipping = {
  name: "Express Shipping",
  reference: "express",
  price_amount_cents: 1200,
  free_over_amount_cents: null,
  formatted_price_amount: "$12.00",
  formatted_free_over_amount: null,
}

const skuMap = {
  SkuPolo001: {
    id: "SkuPolo001",
    type: "skus",
    links: { self: `${BASE}/api/skus/SkuPolo001` },
    attributes: {
      code: "POLOMXXX000000FFFFFFLXXX",
      name: "White Polo L",
      description: "A classic white polo shirt in L size.",
      image_url: `https://img.commercelayer.io/skus/POLOMXXX000000FFFFFFLXXX.png`,
      do_not_ship: false,
      do_not_track: false,
      pieces_per_pack: null,
      weight: null,
      unit_of_weight: null,
      hs_tariff_number: null,
      inbound_tracking: null,
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
      reference: null,
      reference_origin: null,
      metadata: {},
      inventory: {
        available: true,
        quantity: 10,
        levels: [
          {
            quantity: 10,
            delivery_lead_times: [
              makeDeliveryLeadTime(
                { hours: 48, days: 2 },
                { hours: 120, days: 5 },
                standardShipping
              ),
              makeDeliveryLeadTime(
                { hours: 24, days: 1 },
                { hours: 48, days: 2 },
                expressShipping
              ),
            ],
          },
        ],
      },
    },
    relationships: {},
    meta: { mode: "test" },
  },
  SkuAbc001: {
    id: "SkuAbc001",
    type: "skus",
    links: { self: `${BASE}/api/skus/SkuAbc001` },
    attributes: {
      code: "TSHIRTMM000000FFFFFFXLXX",
      name: "Black T-Shirt XL",
      description: "A comfortable black t-shirt in XL size.",
      image_url: `https://img.commercelayer.io/skus/TSHIRTMM000000FFFFFFXLXX.png`,
      do_not_ship: false,
      do_not_track: false,
      pieces_per_pack: null,
      weight: null,
      unit_of_weight: null,
      hs_tariff_number: null,
      inbound_tracking: null,
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
      reference: null,
      reference_origin: null,
      metadata: {},
      inventory: {
        available: true,
        quantity: 5,
        levels: [
          {
            quantity: 5,
            delivery_lead_times: [
              makeDeliveryLeadTime(
                { hours: 72, days: 3 },
                { hours: 168, days: 7 },
                standardShipping
              ),
            ],
          },
        ],
      },
    },
    relationships: {},
    meta: { mode: "test" },
  },
  SkuAbc002: {
    id: "SkuAbc002",
    type: "skus",
    links: { self: `${BASE}/api/skus/SkuAbc002` },
    attributes: {
      code: "PANTSMM000000FFFFFFXXXX",
      name: "Black Pants",
      description: "Classic black pants.",
      image_url: `https://img.commercelayer.io/skus/PANTSMM000000FFFFFFXXXX.png`,
      do_not_ship: false,
      do_not_track: false,
      pieces_per_pack: null,
      weight: null,
      unit_of_weight: null,
      hs_tariff_number: null,
      inbound_tracking: null,
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
      reference: null,
      reference_origin: null,
      metadata: {},
      inventory: {
        available: false,
        quantity: 0,
        levels: [],
      },
    },
    relationships: {},
    meta: { mode: "test" },
  },
}

const allSkus = Object.values(skuMap)

export default [
  // Individual SKU retrieval — used by getSkuAvailability to fetch inventory
  http.get(`${BASE}/api/skus/:id`, ({ params }) => {
    const sku = skuMap[params.id]
    if (sku == null) {
      return HttpResponse.json(
        { errors: [{ title: "Record not found", status: "404" }] },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: sku })
  }),

  // SKU list — used by getSkuAvailability to resolve skuCode → id
  // Filters by filter[code_in] when provided; returns all otherwise.
  http.get(`${BASE}/api/skus`, ({ request }) => {
    const url = new URL(request.url)
    const codeIn = url.searchParams.get("filter[code_in]")
    const filtered =
      codeIn != null
        ? allSkus.filter((s) => s.attributes.code === codeIn)
        : allSkus

    return HttpResponse.json({
      data: filtered,
      meta: {
        record_count: filtered.length,
        page_count: 1,
      },
      links: {
        first: `${BASE}/api/skus?page[number]=1`,
        last: `${BASE}/api/skus?page[number]=1`,
      },
    })
  }),
]
