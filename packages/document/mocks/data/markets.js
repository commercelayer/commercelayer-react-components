import { http } from 'msw'

// used in HookedInputResourceGroup
const someMarkets = http.get(
  'https://mock.localhost/api/markets?fields[markets]=id,name&sort=name&page[size]=3',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'rlEPzheRgO',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/rlEPzheRgO'
            },
            attributes: { name: 'Adyen' },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'dlQbPhNNop',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/dlQbPhNNop'
            },
            attributes: { name: 'Europe' },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'AlRevhXQga',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/AlRevhXQga'
            },
            attributes: { name: 'Milan' },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          }
        ],
        meta: { record_count: 5, page_count: 2 },
        links: {
          first:
            'https://mock.localhost/api/markets?fields%5Bmarkets%5D=id%2Cname&page%5Bnumber%5D=1&page%5Bsize%5D=3&sort=name',
          next: 'https://mock.localhost/api/markets?fields%5Bmarkets%5D=id%2Cname&page%5Bnumber%5D=2&page%5Bsize%5D=3&sort=name',
          last: 'https://mock.localhost/api/markets?fields%5Bmarkets%5D=id%2Cname&page%5Bnumber%5D=2&page%5Bsize%5D=3&sort=name'
        }
      })
    )
  }
)

// used in HookedInputResourceGroup
const allMarkets = http.get(
  'https://mock.localhost/api/markets?sort=name&page[number]=1&page[size]=25',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'rlEPzheRgO',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/rlEPzheRgO'
            },
            attributes: {
              number: 475,
              name: 'Adyen',
              facebook_pixel_id: null,
              checkout_url: '',
              external_prices_url: '',
              external_order_validation_url: null,
              shared_secret: '5a4c961792866897db26dd3aad9c435e',
              private: false,
              disabled_at: null,
              created_at: '2022-08-23T09:59:25.940Z',
              updated_at: '2022-08-23T09:59:25.940Z',
              reference: '',
              reference_origin: '',
              metadata: {}
            },
            relationships: {
              merchant: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/merchant',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/price_list',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/inventory_model',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/subscription_model',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/tax_calculator',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/customer_group',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/markets/rlEPzheRgO/relationships/attachments',
                  related:
                    'https://mock.localhost/api/markets/rlEPzheRgO/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'dlQbPhNNop',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/dlQbPhNNop'
            },
            attributes: {
              number: 350,
              name: 'Europe',
              facebook_pixel_id: null,
              checkout_url: '',
              external_prices_url:
                'https://pippo.malessani.commercelayer.dev/api/verify',
              external_order_validation_url: '',
              shared_secret: '4ea4390961025de791d5bb92e92744eb',
              private: false,
              disabled_at: null,
              created_at: '2022-03-11T09:40:49.000Z',
              updated_at: '2023-03-13T13:30:32.184Z',
              reference: 'market_1',
              reference_origin: 'CLI',
              metadata: {}
            },
            relationships: {
              merchant: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/merchant',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/price_list',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/inventory_model',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/subscription_model',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/tax_calculator',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/customer_group',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/markets/dlQbPhNNop/relationships/attachments',
                  related:
                    'https://mock.localhost/api/markets/dlQbPhNNop/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'AlRevhXQga',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/AlRevhXQga'
            },
            attributes: {
              number: 418,
              name: 'Milan',
              facebook_pixel_id: null,
              checkout_url: '',
              external_prices_url: '',
              external_order_validation_url: null,
              shared_secret: 'fc9954fc7ae851d9588d456656ba102f',
              private: false,
              disabled_at: null,
              created_at: '2022-05-13T12:27:05.075Z',
              updated_at: '2022-05-13T12:27:05.075Z',
              reference: '',
              reference_origin: '',
              metadata: {}
            },
            relationships: {
              merchant: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/merchant',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/price_list',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/inventory_model',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/subscription_model',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/tax_calculator',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/customer_group',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/markets/AlRevhXQga/relationships/attachments',
                  related:
                    'https://mock.localhost/api/markets/AlRevhXQga/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'AjRevhQOoa',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/AjRevhQOoa'
            },
            attributes: {
              number: 351,
              name: 'UK',
              facebook_pixel_id: null,
              checkout_url: null,
              external_prices_url: null,
              external_order_validation_url: null,
              shared_secret: 'a028eb9f9812ee2949da28cd3f8f5268',
              private: false,
              disabled_at: null,
              created_at: '2022-03-11T09:40:50.558Z',
              updated_at: '2022-03-11T09:40:50.558Z',
              reference: 'market_3',
              reference_origin: 'CLI',
              metadata: {}
            },
            relationships: {
              merchant: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/merchant',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/price_list',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/inventory_model',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/subscription_model',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/tax_calculator',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/customer_group',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/markets/AjRevhQOoa/relationships/attachments',
                  related:
                    'https://mock.localhost/api/markets/AjRevhQOoa/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'EjDkXhNEoD',
            type: 'markets',
            links: {
              self: 'https://mock.localhost/api/markets/EjDkXhNEoD'
            },
            attributes: {
              number: 349,
              name: 'USA',
              facebook_pixel_id: null,
              checkout_url: '',
              external_prices_url: '',
              external_order_validation_url: null,
              shared_secret: '60860b96e891725099e0b1a72dceb510',
              private: false,
              disabled_at: null,
              created_at: '2022-02-24T14:08:20.092Z',
              updated_at: '2022-03-21T09:37:44.202Z',
              reference: 'market_2',
              reference_origin: 'CLI',
              metadata: {}
            },
            relationships: {
              merchant: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/merchant',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/price_list',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/inventory_model',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/subscription_model',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/tax_calculator',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/customer_group',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://mock.localhost/api/markets/EjDkXhNEoD/relationships/attachments',
                  related:
                    'https://mock.localhost/api/markets/EjDkXhNEoD/attachments'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          }
        ],
        meta: { record_count: 5, page_count: 1 },
        links: {
          first:
            'https://mock.localhost/api/markets?page%5Bnumber%5D=1&page%5Bsize%5D=25&sort=name',
          last: 'https://mock.localhost/api/markets?page%5Bnumber%5D=1&page%5Bsize%5D=25&sort=name'
        }
      })
    )
  }
)

export default [allMarkets, someMarkets]
