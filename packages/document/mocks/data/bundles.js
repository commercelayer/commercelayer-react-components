import { http } from 'msw'

const bundles = http.get(
  'https://mock.localhost/api/bundles?include=sku_list.sku_list_items.sku&filter[q][code_in]=WELCOME_KIT_001',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'PljQzimxgB',
            type: 'bundles',
            links: {
              self: 'https://mock.localhost/api/bundles/PljQzimxgB'
            },
            attributes: {
              code: 'SHIRTSETSINGLE',
              name: 'Commerce Layer Shirt set single',
              currency_code: 'EUR',
              description: '',
              image_url: '',
              do_not_ship: false,
              do_not_track: false,
              price_amount_cents: 10500,
              price_amount_float: 105.0,
              formatted_price_amount: '€105,00',
              compare_at_amount_cents: 10500,
              compare_at_amount_float: 105.0,
              formatted_compare_at_amount: '€105,00',
              skus_count: 2,
              created_at: '2022-03-11T10:20:48.680Z',
              updated_at: '2022-03-11T10:20:48.680Z',
              reference: '',
              reference_origin: '',
              metadata: {}
            },
            relationships: {
              market: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/market',
                  related:
                    'https://mock.localhost/api/bundles/PljQzimxgB/market'
                }
              },
              sku_list: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/sku_list',
                  related:
                    'https://mock.localhost/api/bundles/PljQzimxgB/sku_list'
                },
                data: { type: 'sku_lists', id: 'myPrZIqano' }
              },
              skus: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/skus',
                  related: 'https://mock.localhost/api/bundles/PljQzimxgB/skus'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/attachments',
                  related:
                    'https://mock.localhost/api/bundles/PljQzimxgB/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/events',
                  related:
                    'https://mock.localhost/api/bundles/PljQzimxgB/events'
                }
              },
              tags: {
                links: {
                  self: 'https://mock.localhost/api/bundles/PljQzimxgB/relationships/tags',
                  related: 'https://mock.localhost/api/bundles/PljQzimxgB/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          }
        ],
        included: [
          {
            id: 'myPrZIqano',
            type: 'sku_lists',
            links: {
              self: 'https://mock.localhost/api/sku_lists/myPrZIqano'
            },
            attributes: {
              name: 'CL SHIRTS (Single shipment)',
              slug: 'cl-shirts-single-shipment',
              description: '',
              image_url: '',
              manual: true,
              sku_code_regex: null,
              created_at: '2022-03-11T10:17:50.637Z',
              updated_at: '2022-03-11T10:18:03.442Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              customer: {
                links: {
                  self: 'https://mock.localhost/api/sku_lists/myPrZIqano/relationships/customer',
                  related:
                    'https://mock.localhost/api/sku_lists/myPrZIqano/customer'
                }
              },
              skus: {
                links: {
                  self: 'https://mock.localhost/api/sku_lists/myPrZIqano/relationships/skus',
                  related:
                    'https://mock.localhost/api/sku_lists/myPrZIqano/skus'
                }
              },
              sku_list_items: {
                links: {
                  self: 'https://mock.localhost/api/sku_lists/myPrZIqano/relationships/sku_list_items',
                  related:
                    'https://mock.localhost/api/sku_lists/myPrZIqano/sku_list_items'
                },
                data: [
                  { type: 'sku_list_items', id: 'LWKOPINkWM' },
                  { type: 'sku_list_items', id: 'vWbjGINmWn' }
                ]
              },
              bundles: {
                links: {
                  self: 'https://mock.localhost/api/sku_lists/myPrZIqano/relationships/bundles',
                  related:
                    'https://mock.localhost/api/sku_lists/myPrZIqano/bundles'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/sku_lists/myPrZIqano/relationships/attachments',
                  related:
                    'https://mock.localhost/api/sku_lists/myPrZIqano/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'LWKOPINkWM',
            type: 'sku_list_items',
            links: {
              self: 'https://mock.localhost/api/sku_list_items/LWKOPINkWM'
            },
            attributes: {
              position: 1,
              sku_code: 'TSHIRTMS000000FFFFFFLXXX',
              quantity: 1,
              created_at: '2022-03-11T10:17:59.154Z',
              updated_at: '2022-03-11T10:17:59.154Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              sku_list: {
                links: {
                  self: 'https://mock.localhost/api/sku_list_items/LWKOPINkWM/relationships/sku_list',
                  related:
                    'https://mock.localhost/api/sku_list_items/LWKOPINkWM/sku_list'
                }
              },
              sku: {
                links: {
                  self: 'https://mock.localhost/api/sku_list_items/LWKOPINkWM/relationships/sku',
                  related:
                    'https://mock.localhost/api/sku_list_items/LWKOPINkWM/sku'
                },
                data: { type: 'skus', id: 'EWzPQSpRzn' }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'vWbjGINmWn',
            type: 'sku_list_items',
            links: {
              self: 'https://mock.localhost/api/sku_list_items/vWbjGINmWn'
            },
            attributes: {
              position: 2,
              sku_code: 'SWEETHMUB7B7B7000000MXXX',
              quantity: 1,
              created_at: '2022-03-11T10:18:03.437Z',
              updated_at: '2022-03-11T10:18:03.437Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              sku_list: {
                links: {
                  self: 'https://mock.localhost/api/sku_list_items/vWbjGINmWn/relationships/sku_list',
                  related:
                    'https://mock.localhost/api/sku_list_items/vWbjGINmWn/sku_list'
                }
              },
              sku: {
                links: {
                  self: 'https://mock.localhost/api/sku_list_items/vWbjGINmWn/relationships/sku',
                  related:
                    'https://mock.localhost/api/sku_list_items/vWbjGINmWn/sku'
                },
                data: { type: 'skus', id: 'MBrxeSaGpZ' }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'EWzPQSpRzn',
            type: 'skus',
            links: {
              self: 'https://mock.localhost/api/skus/EWzPQSpRzn'
            },
            attributes: {
              code: 'TSHIRTMS000000FFFFFFLXXX',
              name: 'Black Men T-Shirt with White Logo (L)',
              description:
                'With a large front pouch pocket and drawstrings in a matching color, this hoodie is a sure crowd-favorite. It’s soft, stylish, and perfect for the cooler evenings.',
              image_url:
                'https://data.commercelayer.app/seed/images/skus/TSHIRTMS000000FFFFFFLXXX_FLAT.png',
              pieces_per_pack: null,
              weight: null,
              unit_of_weight: '',
              hs_tariff_number: '',
              do_not_ship: false,
              do_not_track: false,
              inventory: null,
              created_at: '2022-03-11T09:42:47.300Z',
              updated_at: '2022-03-11T10:17:22.143Z',
              reference: 'sku_69',
              reference_origin: 'CLI',
              metadata: {}
            },
            relationships: {
              shipping_category: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/shipping_category',
                  related:
                    'https://mock.localhost/api/skus/EWzPQSpRzn/shipping_category'
                }
              },
              prices: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/prices',
                  related: 'https://mock.localhost/api/skus/EWzPQSpRzn/prices'
                }
              },
              stock_items: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/stock_items',
                  related:
                    'https://mock.localhost/api/skus/EWzPQSpRzn/stock_items'
                }
              },
              delivery_lead_times: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/delivery_lead_times',
                  related:
                    'https://mock.localhost/api/skus/EWzPQSpRzn/delivery_lead_times'
                }
              },
              sku_options: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/sku_options',
                  related:
                    'https://mock.localhost/api/skus/EWzPQSpRzn/sku_options'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/attachments',
                  related:
                    'https://mock.localhost/api/skus/EWzPQSpRzn/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/events',
                  related: 'https://mock.localhost/api/skus/EWzPQSpRzn/events'
                }
              },
              tags: {
                links: {
                  self: 'https://mock.localhost/api/skus/EWzPQSpRzn/relationships/tags',
                  related: 'https://mock.localhost/api/skus/EWzPQSpRzn/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'MBrxeSaGpZ',
            type: 'skus',
            links: {
              self: 'https://mock.localhost/api/skus/MBrxeSaGpZ'
            },
            attributes: {
              code: 'SWEETHMUB7B7B7000000MXXX',
              name: 'Sport Grey Unisex Hoodie Sweatshirt with Black Logo (M)',
              description:
                'With a large front pouch pocket and drawstrings in a matching color, this hoodie is a sure crowd-favorite. It’s soft, stylish, and perfect for the cooler evenings.',
              image_url:
                'https://data.commercelayer.app/seed/images/skus/HOODIEMX7F7F7F000000MXXX_FLAT.png',
              pieces_per_pack: null,
              weight: null,
              unit_of_weight: '',
              hs_tariff_number: '',
              do_not_ship: false,
              do_not_track: false,
              inventory: null,
              created_at: '2022-03-11T09:42:48.985Z',
              updated_at: '2022-03-11T10:17:41.219Z',
              reference: 'sku_70',
              reference_origin: 'CLI',
              metadata: {}
            },
            relationships: {
              shipping_category: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/shipping_category',
                  related:
                    'https://mock.localhost/api/skus/MBrxeSaGpZ/shipping_category'
                }
              },
              prices: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/prices',
                  related: 'https://mock.localhost/api/skus/MBrxeSaGpZ/prices'
                }
              },
              stock_items: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/stock_items',
                  related:
                    'https://mock.localhost/api/skus/MBrxeSaGpZ/stock_items'
                }
              },
              delivery_lead_times: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/delivery_lead_times',
                  related:
                    'https://mock.localhost/api/skus/MBrxeSaGpZ/delivery_lead_times'
                }
              },
              sku_options: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/sku_options',
                  related:
                    'https://mock.localhost/api/skus/MBrxeSaGpZ/sku_options'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/attachments',
                  related:
                    'https://mock.localhost/api/skus/MBrxeSaGpZ/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/events',
                  related: 'https://mock.localhost/api/skus/MBrxeSaGpZ/events'
                }
              },
              tags: {
                links: {
                  self: 'https://mock.localhost/api/skus/MBrxeSaGpZ/relationships/tags',
                  related: 'https://mock.localhost/api/skus/MBrxeSaGpZ/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          }
        ]
      })
    )
  }
)

export default [bundles]
