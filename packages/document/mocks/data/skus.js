import { http, HttpResponse } from "msw"

const skuList = [
  {
    id: "SkuAbc001",
    type: "skus",
    links: {
      self: "https://react-components-store.commercelayer.io/api/skus/SkuAbc001",
    },
    attributes: {
      code: "TSHIRTMM000000FFFFFFXLXX",
      name: "Black T-Shirt XL",
      description: "A comfortable black t-shirt in XL size.",
      image_url:
        "https://img.commercelayer.io/skus/TSHIRTMM000000FFFFFFXLXX.png",
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
    },
    relationships: {},
    meta: { mode: "test" },
  },
  {
    id: "SkuAbc002",
    type: "skus",
    links: {
      self: "https://react-components-store.commercelayer.io/api/skus/SkuAbc002",
    },
    attributes: {
      code: "PANTSMM000000FFFFFFXXXX",
      name: "Black Pants",
      description: "Classic black pants.",
      image_url:
        "https://img.commercelayer.io/skus/PANTSMM000000FFFFFFXXXX.png",
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
    },
    relationships: {},
    meta: { mode: "test" },
  },
]

// MSW v2 handler (canonical pattern for this project — existing handlers use the v1 compat shim).
// This broad match intercepts all GET /api/skus requests regardless of query params.
// Add more specific handlers above this one if you need different responses per query.
export default [
  http.get("https://react-components-store.commercelayer.io/api/skus", () => {
    return HttpResponse.json({
      data: skuList,
      meta: { record_count: 2, page_count: 1 },
      links: {
        first:
          "https://react-components-store.commercelayer.io/api/skus?page[number]=1",
        last: "https://react-components-store.commercelayer.io/api/skus?page[number]=1",
      },
    })
  }),
]
