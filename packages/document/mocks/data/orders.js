import { http } from 'msw'

const order = {
  id: 'NMWYhbGorj',
  type: 'orders',
  links: {
    self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj'
  },
  attributes: {
    number: 2485862,
    autorefresh: true,
    status: 'approved',
    payment_status: 'paid',
    fulfillment_status: 'in_progress',
    guest: true,
    editable: false,
    customer_email: 'customer@tk.com',
    language_code: 'en',
    currency_code: 'EUR',
    tax_included: true,
    tax_rate: null,
    freight_taxable: null,
    requires_billing_info: true,
    country_code: 'IT',
    shipping_country_code_lock: null,
    coupon_code: null,
    gift_card_code: '9951a05f-741a-4ab1-8405-2a7e57612792',
    gift_card_or_coupon_code: '9951a05f-741a-4ab1-8405-2a7e57612792',
    subtotal_amount_cents: 24400,
    subtotal_amount_float: 244.0,
    formatted_subtotal_amount: '€244,00',
    shipping_amount_cents: 0,
    shipping_amount_float: 0.0,
    formatted_shipping_amount: '€0,00',
    payment_method_amount_cents: 1000,
    payment_method_amount_float: 10.0,
    formatted_payment_method_amount: '€10,00',
    discount_amount_cents: 0,
    discount_amount_float: 0.0,
    formatted_discount_amount: '€0,00',
    adjustment_amount_cents: 0,
    adjustment_amount_float: 0.0,
    formatted_adjustment_amount: '€0,00',
    gift_card_amount_cents: -10000,
    gift_card_amount_float: -100.0,
    formatted_gift_card_amount: '-€100,00',
    total_tax_amount_cents: 0,
    total_tax_amount_float: 0.0,
    formatted_total_tax_amount: '€0,00',
    subtotal_tax_amount_cents: 0,
    subtotal_tax_amount_float: 0.0,
    formatted_subtotal_tax_amount: '€0,00',
    shipping_tax_amount_cents: 0,
    shipping_tax_amount_float: 0.0,
    formatted_shipping_tax_amount: '€0,00',
    payment_method_tax_amount_cents: 0,
    payment_method_tax_amount_float: 0.0,
    formatted_payment_method_tax_amount: '€0,00',
    adjustment_tax_amount_cents: 0,
    adjustment_tax_amount_float: 0.0,
    formatted_adjustment_tax_amount: '€0,00',
    total_amount_cents: 25400,
    total_amount_float: 254.0,
    formatted_total_amount: '€254,00',
    total_taxable_amount_cents: 25400,
    total_taxable_amount_float: 254.0,
    formatted_total_taxable_amount: '€254,00',
    subtotal_taxable_amount_cents: 24400,
    subtotal_taxable_amount_float: 244.0,
    formatted_subtotal_taxable_amount: '€244,00',
    shipping_taxable_amount_cents: 0,
    shipping_taxable_amount_float: 0.0,
    formatted_shipping_taxable_amount: '€0,00',
    payment_method_taxable_amount_cents: 1000,
    payment_method_taxable_amount_float: 10.0,
    formatted_payment_method_taxable_amount: '€10,00',
    adjustment_taxable_amount_cents: 0,
    adjustment_taxable_amount_float: 0.0,
    formatted_adjustment_taxable_amount: '€0,00',
    total_amount_with_taxes_cents: 15400,
    total_amount_with_taxes_float: 154.0,
    formatted_total_amount_with_taxes: '€154,00',
    fees_amount_cents: 0,
    fees_amount_float: 0.0,
    formatted_fees_amount: '€0,00',
    duty_amount_cents: null,
    duty_amount_float: null,
    formatted_duty_amount: null,
    skus_count: 6,
    line_item_options_count: 0,
    shipments_count: 2,
    tax_calculations_count: 0,
    validations_count: 0,
    payment_source_details: {
      type: 'stripe_payment',
      payment_method_id: 'pm_1N8LhuK5j6INEBBIHXkK0FFF',
      payment_method_type: 'card',
      payment_method_details: {
        brand: 'visa',
        last4: '4242',
        checks: {
          cvc_check: 'pass',
          address_line1_check: 'pass',
          address_postal_code_check: 'pass'
        },
        wallet: null,
        country: 'US',
        funding: 'credit',
        exp_year: 2031,
        networks: { available: ['visa'], preferred: null },
        exp_month: 2,
        fingerprint: 'bVaeOEKRmYhi20Nj',
        generated_from: null,
        three_d_secure_usage: { supported: true }
      }
    },
    token: '7fe6285a3dfdabeb8cb9324980743396',
    cart_url: null,
    return_url: null,
    terms_url: null,
    privacy_url: null,
    checkout_url: null,
    placed_at: '2023-05-16T11:06:22.012Z',
    approved_at: '2023-05-16T14:18:16.775Z',
    cancelled_at: null,
    payment_updated_at: '2023-05-16T14:18:35.404Z',
    fulfillment_updated_at: '2023-05-16T14:18:35.411Z',
    refreshed_at: '2023-05-16T11:06:04.613Z',
    archived_at: null,
    expires_at: null,
    subscription_created_at: null,
    created_at: '2023-05-16T11:06:02.074Z',
    updated_at: '2023-05-16T14:18:35.572Z',
    reference: null,
    reference_origin: null,
    metadata: {}
  },
  relationships: {
    market: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/market',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/market'
      },
      data: { type: 'markets', id: 'dlQbPhNNop' }
    },
    customer: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/customer',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/customer'
      },
      data: { type: 'customers', id: 'JkAdBhNGjQ' }
    },
    shipping_address: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/shipping_address',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/shipping_address'
      },
      data: { type: 'addresses', id: 'dPoNukZmnB' }
    },
    billing_address: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/billing_address',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/billing_address'
      },
      data: { type: 'addresses', id: 'dQxruwZDnB' }
    },
    available_payment_methods: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/available_payment_methods',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/available_payment_methods'
      }
    },
    available_customer_payment_sources: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/available_customer_payment_sources',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/available_customer_payment_sources'
      }
    },
    available_free_skus: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/available_free_skus',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/available_free_skus'
      }
    },
    available_free_bundles: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/available_free_bundles',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/available_free_bundles'
      }
    },
    payment_method: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/payment_method',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/payment_method'
      },
      data: { type: 'payment_methods', id: 'wmBvQsARml' }
    },
    payment_source: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/payment_source',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/payment_source'
      },
      data: { type: 'stripe_payments', id: 'onXELSmbQy' }
    },
    line_items: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/line_items',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/line_items'
      },
      data: [
        { type: 'line_items', id: 'vaoMtAZlXy' },
        { type: 'line_items', id: 'kmnptjPlBv' },
        { type: 'line_items', id: 'vWEZtMGVKy' },
        { type: 'line_items', id: 'NqYatGaKnN' },
        { type: 'line_items', id: 'NoEntBwEdk' },
        { type: 'line_items', id: 'NlQmtMAnGy' }
      ]
    },
    shipments: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/shipments',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/shipments'
      },
      data: [
        { type: 'shipments', id: 'YpLwCnNQgY' },
        { type: 'shipments', id: 'PabvCpOxRy' }
      ]
    },
    transactions: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/transactions',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/transactions'
      },
      data: [
        { type: 'authorizations', id: 'nKZkPUDBVj' },
        { type: 'captures', id: 'kyAnxUgegE' }
      ]
    },
    authorizations: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/authorizations',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/authorizations'
      }
    },
    captures: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/captures',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/captures'
      }
    },
    voids: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/voids',
        related: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/voids'
      }
    },
    refunds: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/refunds',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/refunds'
      }
    },
    returns: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/returns',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/returns'
      }
    },
    order_subscriptions: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/order_subscriptions',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/order_subscriptions'
      }
    },
    order_factories: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/order_factories',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/order_factories'
      }
    },
    order_copies: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/order_copies',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/order_copies'
      }
    },
    recurring_order_copies: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/recurring_order_copies',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/recurring_order_copies'
      }
    },
    attachments: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/attachments',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/attachments'
      },
      data: [{ type: 'attachments', id: 'EqGrksxWNW' }]
    },
    events: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/events',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/events'
      }
    },
    tags: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/tags',
        related: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/tags'
      }
    },
    versions: {
      links: {
        self: 'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/relationships/versions',
        related:
          'https://alessani.commercelayer.co/api/orders/NMWYhbGorj/versions'
      }
    }
  },
  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
}

const orderDetail = http.get(
  'https://mock.localhost/api/orders/NMWYhbGorj?include=shipments,transactions,payment_method,payment_source,attachments',
  async (req, res, ctx) => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          res(
            ctx.status(200),
            ctx.json({
              data: order,
              included: [
                {
                  id: 'dlQbPhNNop',
                  type: 'markets',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop'
                  },
                  attributes: {
                    number: 350,
                    name: 'Europe',
                    facebook_pixel_id: null,
                    checkout_url: '',
                    external_prices_url:
                      'https://pippo.malessani.commercelayer.dev/api/verify',
                    external_order_validation_url: '',
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
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/merchant',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/merchant'
                      }
                    },
                    price_list: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/price_list',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/price_list'
                      }
                    },
                    inventory_model: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/inventory_model',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/inventory_model'
                      }
                    },
                    subscription_model: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/subscription_model',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/subscription_model'
                      }
                    },
                    tax_calculator: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/tax_calculator',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/tax_calculator'
                      }
                    },
                    customer_group: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/customer_group',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/customer_group'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/attachments'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'JkAdBhNGjQ',
                  type: 'customers',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ'
                  },
                  attributes: {
                    email: 'customer@tk.com',
                    status: 'repeat',
                    has_password: false,
                    total_orders_count: 2753,
                    created_at: '2022-03-14T09:13:06.633Z',
                    updated_at: '2023-07-31T09:13:06.049Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    customer_group: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_group',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_group'
                      }
                    },
                    customer_addresses: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_addresses',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_addresses'
                      }
                    },
                    customer_payment_sources: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_payment_sources',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_payment_sources'
                      }
                    },
                    customer_subscriptions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_subscriptions',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_subscriptions'
                      }
                    },
                    orders: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/orders',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/orders'
                      }
                    },
                    order_subscriptions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/order_subscriptions',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/order_subscriptions'
                      }
                    },
                    returns: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/returns',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/returns'
                      }
                    },
                    sku_lists: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/sku_lists',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/sku_lists'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/attachments'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'dPoNukZmnB',
                  type: 'addresses',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB'
                  },
                  attributes: {
                    business: false,
                    first_name: 'Darth',
                    last_name: 'Vader',
                    company: null,
                    full_name: 'Darth Vader',
                    line_1: 'Via Morte Nera, 13',
                    line_2: 'Ragnatela, 99',
                    city: 'Cogorno',
                    zip_code: '16030',
                    state_code: 'GE',
                    country_code: 'IT',
                    phone: '+39 055 1234567890',
                    full_address:
                      'Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
                    name: 'Darth Vader, Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
                    email: null,
                    notes: null,
                    lat: null,
                    lng: null,
                    is_localized: false,
                    is_geocoded: false,
                    provider_name: null,
                    map_url: null,
                    static_map_url: null,
                    billing_info: 'ABCDEFGHIJKLMNOPQRSTUVWYXZ',
                    created_at: '2023-05-16T11:06:07.638Z',
                    updated_at: '2023-05-16T11:06:07.638Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    geocoder: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/geocoder',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/geocoder'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/tags'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'dQxruwZDnB',
                  type: 'addresses',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB'
                  },
                  attributes: {
                    business: false,
                    first_name: 'Darth',
                    last_name: 'Vader',
                    company: null,
                    full_name: 'Darth Vader',
                    line_1: 'Via Morte Nera, 13',
                    line_2: 'Ragnatela, 99',
                    city: 'Cogorno',
                    zip_code: '16030',
                    state_code: 'GE',
                    country_code: 'IT',
                    phone: '+39 055 1234567890',
                    full_address:
                      'Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
                    name: 'Darth Vader, Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
                    email: null,
                    notes: null,
                    lat: null,
                    lng: null,
                    is_localized: false,
                    is_geocoded: false,
                    provider_name: null,
                    map_url: null,
                    static_map_url: null,
                    billing_info: 'ABCDEFGHIJKLMNOPQRSTUVWYXZ',
                    created_at: '2023-05-16T11:06:07.493Z',
                    updated_at: '2023-05-16T11:06:07.493Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    geocoder: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/geocoder',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/geocoder'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/tags'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'wmBvQsARml',
                  type: 'payment_methods',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml'
                  },
                  attributes: {
                    payment_source_type: 'stripe_payments',
                    name: 'Stripe Payment',
                    currency_code: 'EUR',
                    moto: false,
                    require_capture: true,
                    auto_capture: false,
                    disabled_at: null,
                    price_amount_cents: 1000,
                    price_amount_float: 10.0,
                    formatted_price_amount: '€10,00',
                    auto_capture_max_amount_cents: null,
                    auto_capture_max_amount_float: null,
                    formatted_auto_capture_max_amount: null,
                    created_at: '2022-03-11T14:18:08.420Z',
                    updated_at: '2022-03-11T14:18:08.420Z',
                    reference: '',
                    reference_origin: '',
                    metadata: {}
                  },
                  relationships: {
                    market: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/market',
                        related:
                          'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/market'
                      }
                    },
                    payment_gateway: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/payment_gateway',
                        related:
                          'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/payment_gateway'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/attachments'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'onXELSmbQy',
                  type: 'stripe_payments',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy'
                  },
                  attributes: {
                    client_secret:
                      'pi_3N8LhsK5j6INEBBI0JicoLOo_secret_CKWfEPSnvyBHIQrEfRXkrJYd7',
                    publishable_key:
                      'pk_test_51KH86yK5j6INEBBIdkXoh0UwOoOlAbFZc3b8j0vjRHKQHdaUfEJm24F0A9QkrQXVlgh1nXJCpWR6PG3epaUWzE2z00BdEe9fho',
                    options: {
                      id: 'pm_1N8LhuK5j6INEBBI71U1QOlu',
                      card: {
                        brand: 'visa',
                        last4: '4242',
                        checks: {
                          cvc_check: null,
                          address_line1_check: null,
                          address_postal_code_check: null
                        },
                        wallet: null,
                        country: 'US',
                        funding: 'credit',
                        exp_year: 2031,
                        networks: { available: ['visa'], preferred: null },
                        exp_month: 2,
                        generated_from: null,
                        three_d_secure_usage: { supported: true }
                      },
                      type: 'card',
                      object: 'payment_method',
                      created: 1684235178,
                      customer: null,
                      livemode: false,
                      billing_details: {
                        name: 'Darth Vader',
                        email: 'customer@tk.com',
                        phone: '+39 055 1234567890',
                        address: {
                          city: 'Cogorno',
                          line1: 'Via Morte Nera, 13',
                          line2: null,
                          state: 'GE',
                          country: 'IT',
                          postal_code: '16030'
                        }
                      },
                      setup_future_usage: 'off_session',
                      intent_amount_cents: 15400
                    },
                    payment_method: {
                      id: 'pm_1N8LhuK5j6INEBBIHXkK0FFF',
                      card: {
                        brand: 'visa',
                        last4: '4242',
                        checks: {
                          cvc_check: 'pass',
                          address_line1_check: 'pass',
                          address_postal_code_check: 'pass'
                        },
                        wallet: null,
                        country: 'US',
                        funding: 'credit',
                        exp_year: 2031,
                        networks: { available: ['visa'], preferred: null },
                        exp_month: 2,
                        fingerprint: 'bVaeOEKRmYhi20Nj',
                        generated_from: null,
                        three_d_secure_usage: { supported: true }
                      },
                      type: 'card',
                      object: 'payment_method',
                      created: 1684235179,
                      customer: null,
                      livemode: false,
                      metadata: {},
                      billing_details: {
                        name: 'Darth Vader',
                        email: 'customer@tk.com',
                        phone: '+39 055 1234567890',
                        address: {
                          city: 'Cogorno',
                          line1: 'Via Morte Nera, 13',
                          line2: null,
                          state: 'GE',
                          country: 'IT',
                          postal_code: '16030'
                        }
                      }
                    },
                    mismatched_amounts: false,
                    intent_amount_cents: 15400,
                    intent_amount_float: 154.0,
                    formatted_intent_amount: '€154,00',
                    return_url: null,
                    payment_instrument: {
                      issuer_type: 'card',
                      card_type: 'visa',
                      card_last_digits: '4242',
                      card_expiry_month: '2',
                      card_expiry_year: '2031'
                    },
                    created_at: '2023-05-16T11:06:16.338Z',
                    updated_at: '2023-05-16T11:06:21.948Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/order'
                      }
                    },
                    payment_gateway: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/payment_gateway',
                        related:
                          'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/payment_gateway'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'vaoMtAZlXy',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy'
                  },
                  attributes: {
                    sku_code: null,
                    bundle_code: null,
                    quantity: 1,
                    currency_code: 'EUR',
                    unit_amount_cents: -10000,
                    unit_amount_float: -100.0,
                    formatted_unit_amount: '-€100,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: 0,
                    discount_float: 0.0,
                    formatted_discount: '€0,00',
                    total_amount_cents: -10000,
                    total_amount_float: -100.0,
                    formatted_total_amount: '-€100,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'Gift card: €100,00',
                    image_url: null,
                    discount_breakdown: {},
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'gift_cards',
                    frequency: null,
                    created_at: '2023-05-16T11:06:14.674Z',
                    updated_at: '2023-05-16T11:06:14.674Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'kmnptjPlBv',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv'
                  },
                  attributes: {
                    sku_code: null,
                    bundle_code: null,
                    quantity: 1,
                    currency_code: 'EUR',
                    unit_amount_cents: 1000,
                    unit_amount_float: 10.0,
                    formatted_unit_amount: '€10,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: 0,
                    discount_float: 0.0,
                    formatted_discount: '€0,00',
                    total_amount_cents: 1000,
                    total_amount_float: 10.0,
                    formatted_total_amount: '€10,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'Stripe Payment',
                    image_url: null,
                    discount_breakdown: {},
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'payment_methods',
                    frequency: null,
                    created_at: '2023-05-16T11:06:14.629Z',
                    updated_at: '2023-05-16T11:06:14.629Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'vWEZtMGVKy',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy'
                  },
                  attributes: {
                    sku_code: null,
                    bundle_code: null,
                    quantity: 1,
                    currency_code: 'EUR',
                    unit_amount_cents: 0,
                    unit_amount_float: 0.0,
                    formatted_unit_amount: '€0,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: 0,
                    discount_float: 0.0,
                    formatted_discount: '€0,00',
                    total_amount_cents: 0,
                    total_amount_float: 0.0,
                    formatted_total_amount: '€0,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'Shipment #2485862/S/001',
                    image_url: null,
                    discount_breakdown: {},
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'shipments',
                    frequency: null,
                    created_at: '2023-05-16T11:06:09.728Z',
                    updated_at: '2023-05-16T11:06:09.728Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'NqYatGaKnN',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN'
                  },
                  attributes: {
                    sku_code: null,
                    bundle_code: null,
                    quantity: 1,
                    currency_code: 'EUR',
                    unit_amount_cents: 0,
                    unit_amount_float: 0.0,
                    formatted_unit_amount: '€0,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: 0,
                    discount_float: 0.0,
                    formatted_discount: '€0,00',
                    total_amount_cents: 0,
                    total_amount_float: 0.0,
                    formatted_total_amount: '€0,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'Shipment #2485862/S/002',
                    image_url: null,
                    discount_breakdown: {},
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'shipments',
                    frequency: null,
                    created_at: '2023-05-16T11:06:09.602Z',
                    updated_at: '2023-05-16T11:06:09.602Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'NoEntBwEdk',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk'
                  },
                  attributes: {
                    sku_code: 'TSHIRTMMFFFFFF000000XLXX',
                    bundle_code: null,
                    quantity: 5,
                    currency_code: 'EUR',
                    unit_amount_cents: 2900,
                    unit_amount_float: 29.0,
                    formatted_unit_amount: '€29,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: -5943,
                    discount_float: -59.43,
                    formatted_discount: '-€59,43',
                    total_amount_cents: 14500,
                    total_amount_float: 145.0,
                    formatted_total_amount: '€145,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'White Men T-Shirt with Black Logo (XL)',
                    image_url:
                      'https://data.commercelayer.app/seed/images/skus/TSHIRTMSFFFFFF000000XLXX_FLAT.png',
                    discount_breakdown: {
                      vaoMtAZlXy: { cents: -5943, weight: 0.5942622950819673 }
                    },
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'skus',
                    frequency: null,
                    created_at: '2023-05-16T11:06:02.458Z',
                    updated_at: '2023-05-16T11:06:02.458Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'NlQmtMAnGy',
                  type: 'line_items',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy'
                  },
                  attributes: {
                    sku_code: 'CANVASAU000000FFFFFF1824',
                    bundle_code: null,
                    quantity: 1,
                    currency_code: 'EUR',
                    unit_amount_cents: 9900,
                    unit_amount_float: 99.0,
                    formatted_unit_amount: '€99,00',
                    options_amount_cents: 0,
                    options_amount_float: 0.0,
                    formatted_options_amount: '€0,00',
                    discount_cents: -4057,
                    discount_float: -40.57,
                    formatted_discount: '-€40,57',
                    total_amount_cents: 9900,
                    total_amount_float: 99.0,
                    formatted_total_amount: '€99,00',
                    tax_amount_cents: 0,
                    tax_amount_float: 0.0,
                    formatted_tax_amount: '€0,00',
                    name: 'Black Canvas with White Logo (18x24)',
                    image_url:
                      'https://img.commercelayer.io/skus/CANVASAU000000FFFFFF.png?fm=jpg&q=90',
                    discount_breakdown: {
                      vaoMtAZlXy: { cents: -4057, weight: 0.4057377049180328 }
                    },
                    tax_rate: 0.0,
                    tax_breakdown: {},
                    item_type: 'skus',
                    frequency: null,
                    created_at: '2023-05-16T11:06:02.444Z',
                    updated_at: '2023-05-16T11:06:02.444Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/order'
                      }
                    },
                    item: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/item',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/item'
                      }
                    },
                    line_item_options: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/line_item_options',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/line_item_options'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/shipment_line_items'
                      }
                    },
                    stock_reservations: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_reservations',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_reservations'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_transfers'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/events'
                      }
                    },
                    tags: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/tags',
                        related:
                          'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/tags'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'YpLwCnNQgY',
                  type: 'shipments',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY'
                  },
                  attributes: {
                    number: '2485862/S/001',
                    status: 'on_hold',
                    currency_code: 'EUR',
                    cost_amount_cents: 0,
                    cost_amount_float: 0.0,
                    formatted_cost_amount: '$0.00',
                    skus_count: 5,
                    selected_rate_id: null,
                    rates: [],
                    purchase_error_code: null,
                    purchase_error_message: null,
                    get_rates_errors: [],
                    get_rates_started_at: null,
                    get_rates_completed_at: null,
                    purchase_started_at: null,
                    purchase_completed_at: null,
                    purchase_failed_at: null,
                    on_hold_at: '2023-07-21T14:12:13.287Z',
                    picking_at: '2023-07-21T14:12:08.574Z',
                    packing_at: '2023-07-21T14:10:54.107Z',
                    ready_to_ship_at: null,
                    shipped_at: null,
                    created_at: '2023-05-16T11:06:07.685Z',
                    updated_at: '2023-07-21T14:12:13.286Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/order'
                      }
                    },
                    shipping_category: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_category',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_category'
                      }
                    },
                    stock_location: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_location',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_location'
                      }
                    },
                    origin_address: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/origin_address',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/origin_address'
                      }
                    },
                    shipping_address: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_address',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_address'
                      }
                    },
                    shipping_method: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_method',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_method'
                      }
                    },
                    delivery_lead_time: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/delivery_lead_time',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/delivery_lead_time'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipment_line_items'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_transfers'
                      }
                    },
                    available_shipping_methods: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/available_shipping_methods',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/available_shipping_methods'
                      }
                    },
                    carrier_accounts: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/carrier_accounts',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/carrier_accounts'
                      }
                    },
                    parcels: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/parcels',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/parcels'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/attachments'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/events'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'PabvCpOxRy',
                  type: 'shipments',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy'
                  },
                  attributes: {
                    number: '2485862/S/002',
                    status: 'shipped',
                    currency_code: 'EUR',
                    cost_amount_cents: 0,
                    cost_amount_float: 0.0,
                    formatted_cost_amount: '$0.00',
                    skus_count: 1,
                    selected_rate_id: null,
                    rates: [],
                    purchase_error_code: null,
                    purchase_error_message: null,
                    get_rates_errors: [],
                    get_rates_started_at: null,
                    get_rates_completed_at: null,
                    purchase_started_at: null,
                    purchase_completed_at: null,
                    purchase_failed_at: null,
                    on_hold_at: null,
                    picking_at: '2023-05-16T14:18:35.559Z',
                    packing_at: '2023-05-16T14:20:24.459Z',
                    ready_to_ship_at: '2023-05-16T14:21:43.665Z',
                    shipped_at: '2023-05-16T14:22:42.632Z',
                    created_at: '2023-05-16T11:06:07.711Z',
                    updated_at: '2023-05-16T14:22:42.633Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {}
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/order'
                      }
                    },
                    shipping_category: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_category',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_category'
                      }
                    },
                    stock_location: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_location',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_location'
                      }
                    },
                    origin_address: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/origin_address',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/origin_address'
                      }
                    },
                    shipping_address: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_address',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_address'
                      }
                    },
                    shipping_method: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_method',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_method'
                      }
                    },
                    delivery_lead_time: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/delivery_lead_time',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/delivery_lead_time'
                      }
                    },
                    shipment_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipment_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipment_line_items'
                      }
                    },
                    stock_line_items: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_line_items',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_line_items'
                      }
                    },
                    stock_transfers: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_transfers',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_transfers'
                      }
                    },
                    available_shipping_methods: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/available_shipping_methods',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/available_shipping_methods'
                      }
                    },
                    carrier_accounts: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/carrier_accounts',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/carrier_accounts'
                      }
                    },
                    parcels: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/parcels',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/parcels'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/attachments'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/events'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/versions'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'nKZkPUDBVj',
                  type: 'authorizations',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj'
                  },
                  attributes: {
                    number: '2485862/T/001',
                    currency_code: 'EUR',
                    amount_cents: 15400,
                    amount_float: 154.0,
                    formatted_amount: '€154,00',
                    succeeded: true,
                    message: 'Success!',
                    error_code: null,
                    error_detail: null,
                    token: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
                    gateway_transaction_id: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
                    created_at: '2023-05-16T11:06:21.964Z',
                    updated_at: '2023-05-16T11:06:21.964Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {},
                    cvv_code: null,
                    cvv_message: null,
                    avs_code: null,
                    avs_message: null,
                    fraud_review: null,
                    capture_amount_cents: 0,
                    capture_amount_float: 0.0,
                    formatted_capture_amount: '€0,00',
                    capture_balance_cents: 0,
                    capture_balance_float: 0.0,
                    formatted_capture_balance: '€0,00',
                    void_balance_cents: 15400,
                    void_balance_float: 154.0,
                    formatted_void_balance: '€154,00'
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/order'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/attachments'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/versions'
                      }
                    },
                    captures: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/captures',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/captures'
                      }
                    },
                    voids: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/voids',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/voids'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/events'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'kyAnxUgegE',
                  type: 'captures',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE'
                  },
                  attributes: {
                    number: '2485862/T/002',
                    currency_code: 'EUR',
                    amount_cents: 15400,
                    amount_float: 154.0,
                    formatted_amount: '€154,00',
                    succeeded: true,
                    message: 'Success!',
                    error_code: null,
                    error_detail: null,
                    token: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
                    gateway_transaction_id: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
                    created_at: '2023-05-16T14:18:35.368Z',
                    updated_at: '2023-05-16T14:18:35.368Z',
                    reference: null,
                    reference_origin: null,
                    metadata: {},
                    refund_amount_cents: 15400,
                    refund_amount_float: 154.0,
                    formatted_refund_amount: '€154,00',
                    refund_balance_cents: 15400,
                    refund_balance_float: 154.0,
                    formatted_refund_balance: '€154,00'
                  },
                  relationships: {
                    order: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/order',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/order'
                      }
                    },
                    attachments: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/attachments',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/attachments'
                      }
                    },
                    versions: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/versions',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/versions'
                      }
                    },
                    reference_authorization: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/reference_authorization',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/reference_authorization'
                      }
                    },
                    refunds: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/refunds',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/refunds'
                      }
                    },
                    events: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/events',
                        related:
                          'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/events'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                },
                {
                  id: 'EqGrksxWNW',
                  type: 'attachments',
                  links: {
                    self: 'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW'
                  },
                  attributes: {
                    name: 'M. Montalbano',
                    description: 'Ehi there!',
                    url: null,
                    created_at: '2023-07-20T13:58:52.184Z',
                    updated_at: '2023-07-20T13:58:52.184Z',
                    reference: null,
                    reference_origin: 'app-orders--note',
                    metadata: {}
                  },
                  relationships: {
                    attachable: {
                      links: {
                        self: 'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW/relationships/attachable',
                        related:
                          'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW/attachable'
                      }
                    }
                  },
                  meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
                }
              ]
            })
          )
        )
      }, 2000)
    })
  }
)

function getRandomFormattedPrice() {
  return `€${Math.floor(Math.random() * 1000)}.00`
}

function getRandomOrderStatus() {
  const statues = [
    {
      status: 'placed',
      payment_status: 'authorized',
      fulfillment_status: 'unfulfilled'
    },
    {
      status: 'approved',
      payment_status: 'paid',
      fulfillment_status: 'in_progress'
    },
    {
      status: 'approved',
      payment_status: 'paid',
      fulfillment_status: 'fulfilled'
    }
  ]
  return statues[Math.floor(Math.random() * statues.length)]
}

const orderList = http.get(
  'https://mock.localhost/api/orders',
  async (req, res, ctx) => {
    const currentPage = parseInt(
      req.url.searchParams.get('page[number]') ?? '1'
    )
    const itemPerPage = parseInt(req.url.searchParams.get('page[size]') ?? '5')
    const pageCount = itemPerPage <= 5 ? 1 : 3

    return res(
      ctx.delay(2000),
      ctx.status(200),
      ctx.json({
        data: Array(itemPerPage)
          .fill(order)
          .map((order, idx) => ({
            ...order,
            id: `mocked-${currentPage}-${idx}`,
            attributes: {
              ...order.attributes,
              number: parseInt(`26372${currentPage}${idx}`, 10),
              formatted_total_amount: getRandomFormattedPrice(),
              ...getRandomOrderStatus()
            }
          })),
        meta: {
          record_count: itemPerPage * pageCount,
          page_count: pageCount
        },
        included: [
          {
            id: 'dlQbPhNNop',
            type: 'markets',
            links: {
              self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop'
            },
            attributes: {
              number: 350,
              name: 'Europe',
              facebook_pixel_id: null,
              checkout_url: '',
              external_prices_url:
                'https://pippo.malessani.commercelayer.dev/api/verify',
              external_order_validation_url: '',
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
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/merchant',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/merchant'
                }
              },
              price_list: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/price_list',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/price_list'
                }
              },
              inventory_model: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/inventory_model',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/inventory_model'
                }
              },
              subscription_model: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/subscription_model',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/subscription_model'
                }
              },
              tax_calculator: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/tax_calculator',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/tax_calculator'
                }
              },
              customer_group: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/customer_group',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/customer_group'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/attachments'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/markets/dlQbPhNNop/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'JkAdBhNGjQ',
            type: 'customers',
            links: {
              self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ'
            },
            attributes: {
              email: 'customer@tk.com',
              status: 'repeat',
              has_password: false,
              total_orders_count: 2753,
              created_at: '2022-03-14T09:13:06.633Z',
              updated_at: '2023-07-31T09:13:06.049Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              customer_group: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_group',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_group'
                }
              },
              customer_addresses: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_addresses',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_addresses'
                }
              },
              customer_payment_sources: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_payment_sources',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_payment_sources'
                }
              },
              customer_subscriptions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/customer_subscriptions',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/customer_subscriptions'
                }
              },
              orders: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/orders',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/orders'
                }
              },
              order_subscriptions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/order_subscriptions',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/order_subscriptions'
                }
              },
              returns: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/returns',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/returns'
                }
              },
              sku_lists: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/sku_lists',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/sku_lists'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/customers/JkAdBhNGjQ/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'dPoNukZmnB',
            type: 'addresses',
            links: {
              self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB'
            },
            attributes: {
              business: false,
              first_name: 'Darth',
              last_name: 'Vader',
              company: null,
              full_name: 'Darth Vader',
              line_1: 'Via Morte Nera, 13',
              line_2: 'Ragnatela, 99',
              city: 'Cogorno',
              zip_code: '16030',
              state_code: 'GE',
              country_code: 'IT',
              phone: '+39 055 1234567890',
              full_address:
                'Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
              name: 'Darth Vader, Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
              email: null,
              notes: null,
              lat: null,
              lng: null,
              is_localized: false,
              is_geocoded: false,
              provider_name: null,
              map_url: null,
              static_map_url: null,
              billing_info: 'ABCDEFGHIJKLMNOPQRSTUVWYXZ',
              created_at: '2023-05-16T11:06:07.638Z',
              updated_at: '2023-05-16T11:06:07.638Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              geocoder: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/geocoder',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/geocoder'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/tags'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dPoNukZmnB/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'dQxruwZDnB',
            type: 'addresses',
            links: {
              self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB'
            },
            attributes: {
              business: false,
              first_name: 'Darth',
              last_name: 'Vader',
              company: null,
              full_name: 'Darth Vader',
              line_1: 'Via Morte Nera, 13',
              line_2: 'Ragnatela, 99',
              city: 'Cogorno',
              zip_code: '16030',
              state_code: 'GE',
              country_code: 'IT',
              phone: '+39 055 1234567890',
              full_address:
                'Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
              name: 'Darth Vader, Via Morte Nera, 13 Ragnatela, 99, 16030 Cogorno GE (IT) +39 055 1234567890',
              email: null,
              notes: null,
              lat: null,
              lng: null,
              is_localized: false,
              is_geocoded: false,
              provider_name: null,
              map_url: null,
              static_map_url: null,
              billing_info: 'ABCDEFGHIJKLMNOPQRSTUVWYXZ',
              created_at: '2023-05-16T11:06:07.493Z',
              updated_at: '2023-05-16T11:06:07.493Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              geocoder: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/geocoder',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/geocoder'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/tags'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/addresses/dQxruwZDnB/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'wmBvQsARml',
            type: 'payment_methods',
            links: {
              self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml'
            },
            attributes: {
              payment_source_type: 'stripe_payments',
              name: 'Stripe Payment',
              currency_code: 'EUR',
              moto: false,
              require_capture: true,
              auto_capture: false,
              disabled_at: null,
              price_amount_cents: 1000,
              price_amount_float: 10.0,
              formatted_price_amount: '€10,00',
              auto_capture_max_amount_cents: null,
              auto_capture_max_amount_float: null,
              formatted_auto_capture_max_amount: null,
              created_at: '2022-03-11T14:18:08.420Z',
              updated_at: '2022-03-11T14:18:08.420Z',
              reference: '',
              reference_origin: '',
              metadata: {}
            },
            relationships: {
              market: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/market',
                  related:
                    'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/market'
                }
              },
              payment_gateway: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/payment_gateway',
                  related:
                    'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/payment_gateway'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/attachments'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/payment_methods/wmBvQsARml/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'onXELSmbQy',
            type: 'stripe_payments',
            links: {
              self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy'
            },
            attributes: {
              client_secret:
                'pi_3N8LhsK5j6INEBBI0JicoLOo_secret_CKWfEPSnvyBHIQrEfRXkrJYd7',
              publishable_key:
                'pk_test_51KH86yK5j6INEBBIdkXoh0UwOoOlAbFZc3b8j0vjRHKQHdaUfEJm24F0A9QkrQXVlgh1nXJCpWR6PG3epaUWzE2z00BdEe9fho',
              options: {
                id: 'pm_1N8LhuK5j6INEBBI71U1QOlu',
                card: {
                  brand: 'visa',
                  last4: '4242',
                  checks: {
                    cvc_check: null,
                    address_line1_check: null,
                    address_postal_code_check: null
                  },
                  wallet: null,
                  country: 'US',
                  funding: 'credit',
                  exp_year: 2031,
                  networks: { available: ['visa'], preferred: null },
                  exp_month: 2,
                  generated_from: null,
                  three_d_secure_usage: { supported: true }
                },
                type: 'card',
                object: 'payment_method',
                created: 1684235178,
                customer: null,
                livemode: false,
                billing_details: {
                  name: 'Darth Vader',
                  email: 'customer@tk.com',
                  phone: '+39 055 1234567890',
                  address: {
                    city: 'Cogorno',
                    line1: 'Via Morte Nera, 13',
                    line2: null,
                    state: 'GE',
                    country: 'IT',
                    postal_code: '16030'
                  }
                },
                setup_future_usage: 'off_session',
                intent_amount_cents: 15400
              },
              payment_method: {
                id: 'pm_1N8LhuK5j6INEBBIHXkK0FFF',
                card: {
                  brand: 'visa',
                  last4: '4242',
                  checks: {
                    cvc_check: 'pass',
                    address_line1_check: 'pass',
                    address_postal_code_check: 'pass'
                  },
                  wallet: null,
                  country: 'US',
                  funding: 'credit',
                  exp_year: 2031,
                  networks: { available: ['visa'], preferred: null },
                  exp_month: 2,
                  fingerprint: 'bVaeOEKRmYhi20Nj',
                  generated_from: null,
                  three_d_secure_usage: { supported: true }
                },
                type: 'card',
                object: 'payment_method',
                created: 1684235179,
                customer: null,
                livemode: false,
                metadata: {},
                billing_details: {
                  name: 'Darth Vader',
                  email: 'customer@tk.com',
                  phone: '+39 055 1234567890',
                  address: {
                    city: 'Cogorno',
                    line1: 'Via Morte Nera, 13',
                    line2: null,
                    state: 'GE',
                    country: 'IT',
                    postal_code: '16030'
                  }
                }
              },
              mismatched_amounts: false,
              intent_amount_cents: 15400,
              intent_amount_float: 154.0,
              formatted_intent_amount: '€154,00',
              return_url: null,
              payment_instrument: {
                issuer_type: 'card',
                card_type: 'visa',
                card_last_digits: '4242',
                card_expiry_month: '2',
                card_expiry_year: '2031'
              },
              created_at: '2023-05-16T11:06:16.338Z',
              updated_at: '2023-05-16T11:06:21.948Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/order'
                }
              },
              payment_gateway: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/payment_gateway',
                  related:
                    'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/payment_gateway'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/stripe_payments/onXELSmbQy/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'vaoMtAZlXy',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy'
            },
            attributes: {
              sku_code: null,
              bundle_code: null,
              quantity: 1,
              currency_code: 'EUR',
              unit_amount_cents: -10000,
              unit_amount_float: -100.0,
              formatted_unit_amount: '-€100,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: 0,
              discount_float: 0.0,
              formatted_discount: '€0,00',
              total_amount_cents: -10000,
              total_amount_float: -100.0,
              formatted_total_amount: '-€100,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'Gift card: €100,00',
              image_url: null,
              discount_breakdown: {},
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'gift_cards',
              frequency: null,
              created_at: '2023-05-16T11:06:14.674Z',
              updated_at: '2023-05-16T11:06:14.674Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vaoMtAZlXy/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'kmnptjPlBv',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv'
            },
            attributes: {
              sku_code: null,
              bundle_code: null,
              quantity: 1,
              currency_code: 'EUR',
              unit_amount_cents: 1000,
              unit_amount_float: 10.0,
              formatted_unit_amount: '€10,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: 0,
              discount_float: 0.0,
              formatted_discount: '€0,00',
              total_amount_cents: 1000,
              total_amount_float: 10.0,
              formatted_total_amount: '€10,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'Stripe Payment',
              image_url: null,
              discount_breakdown: {},
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'payment_methods',
              frequency: null,
              created_at: '2023-05-16T11:06:14.629Z',
              updated_at: '2023-05-16T11:06:14.629Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/kmnptjPlBv/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'vWEZtMGVKy',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy'
            },
            attributes: {
              sku_code: null,
              bundle_code: null,
              quantity: 1,
              currency_code: 'EUR',
              unit_amount_cents: 0,
              unit_amount_float: 0.0,
              formatted_unit_amount: '€0,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: 0,
              discount_float: 0.0,
              formatted_discount: '€0,00',
              total_amount_cents: 0,
              total_amount_float: 0.0,
              formatted_total_amount: '€0,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'Shipment #2485862/S/001',
              image_url: null,
              discount_breakdown: {},
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'shipments',
              frequency: null,
              created_at: '2023-05-16T11:06:09.728Z',
              updated_at: '2023-05-16T11:06:09.728Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/vWEZtMGVKy/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'NqYatGaKnN',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN'
            },
            attributes: {
              sku_code: null,
              bundle_code: null,
              quantity: 1,
              currency_code: 'EUR',
              unit_amount_cents: 0,
              unit_amount_float: 0.0,
              formatted_unit_amount: '€0,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: 0,
              discount_float: 0.0,
              formatted_discount: '€0,00',
              total_amount_cents: 0,
              total_amount_float: 0.0,
              formatted_total_amount: '€0,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'Shipment #2485862/S/002',
              image_url: null,
              discount_breakdown: {},
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'shipments',
              frequency: null,
              created_at: '2023-05-16T11:06:09.602Z',
              updated_at: '2023-05-16T11:06:09.602Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NqYatGaKnN/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'NoEntBwEdk',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk'
            },
            attributes: {
              sku_code: 'TSHIRTMMFFFFFF000000XLXX',
              bundle_code: null,
              quantity: 5,
              currency_code: 'EUR',
              unit_amount_cents: 2900,
              unit_amount_float: 29.0,
              formatted_unit_amount: '€29,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: -5943,
              discount_float: -59.43,
              formatted_discount: '-€59,43',
              total_amount_cents: 14500,
              total_amount_float: 145.0,
              formatted_total_amount: '€145,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'White Men T-Shirt with Black Logo (XL)',
              image_url:
                'https://data.commercelayer.app/seed/images/skus/TSHIRTMSFFFFFF000000XLXX_FLAT.png',
              discount_breakdown: {
                vaoMtAZlXy: { cents: -5943, weight: 0.5942622950819673 }
              },
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'skus',
              frequency: null,
              created_at: '2023-05-16T11:06:02.458Z',
              updated_at: '2023-05-16T11:06:02.458Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NoEntBwEdk/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'NlQmtMAnGy',
            type: 'line_items',
            links: {
              self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy'
            },
            attributes: {
              sku_code: 'CANVASAU000000FFFFFF1824',
              bundle_code: null,
              quantity: 1,
              currency_code: 'EUR',
              unit_amount_cents: 9900,
              unit_amount_float: 99.0,
              formatted_unit_amount: '€99,00',
              options_amount_cents: 0,
              options_amount_float: 0.0,
              formatted_options_amount: '€0,00',
              discount_cents: -4057,
              discount_float: -40.57,
              formatted_discount: '-€40,57',
              total_amount_cents: 9900,
              total_amount_float: 99.0,
              formatted_total_amount: '€99,00',
              tax_amount_cents: 0,
              tax_amount_float: 0.0,
              formatted_tax_amount: '€0,00',
              name: 'Black Canvas with White Logo (18x24)',
              image_url:
                'https://img.commercelayer.io/skus/CANVASAU000000FFFFFF.png?fm=jpg&q=90',
              discount_breakdown: {
                vaoMtAZlXy: { cents: -4057, weight: 0.4057377049180328 }
              },
              tax_rate: 0.0,
              tax_breakdown: {},
              item_type: 'skus',
              frequency: null,
              created_at: '2023-05-16T11:06:02.444Z',
              updated_at: '2023-05-16T11:06:02.444Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/order'
                }
              },
              item: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/item',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/item'
                }
              },
              line_item_options: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/line_item_options',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/line_item_options'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/shipment_line_items'
                }
              },
              stock_reservations: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_reservations',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_reservations'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/stock_transfers'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/events'
                }
              },
              tags: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/relationships/tags',
                  related:
                    'https://alessani.commercelayer.co/api/line_items/NlQmtMAnGy/tags'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'YpLwCnNQgY',
            type: 'shipments',
            links: {
              self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY'
            },
            attributes: {
              number: '2485862/S/001',
              status: 'on_hold',
              currency_code: 'EUR',
              cost_amount_cents: 0,
              cost_amount_float: 0.0,
              formatted_cost_amount: '$0.00',
              skus_count: 5,
              selected_rate_id: null,
              rates: [],
              purchase_error_code: null,
              purchase_error_message: null,
              get_rates_errors: [],
              get_rates_started_at: null,
              get_rates_completed_at: null,
              purchase_started_at: null,
              purchase_completed_at: null,
              purchase_failed_at: null,
              on_hold_at: '2023-07-21T14:12:13.287Z',
              picking_at: '2023-07-21T14:12:08.574Z',
              packing_at: '2023-07-21T14:10:54.107Z',
              ready_to_ship_at: null,
              shipped_at: null,
              created_at: '2023-05-16T11:06:07.685Z',
              updated_at: '2023-07-21T14:12:13.286Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/order'
                }
              },
              shipping_category: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_category',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_category'
                }
              },
              stock_location: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_location',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_location'
                }
              },
              origin_address: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/origin_address',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/origin_address'
                }
              },
              shipping_address: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_address',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_address'
                }
              },
              shipping_method: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipping_method',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipping_method'
                }
              },
              delivery_lead_time: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/delivery_lead_time',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/delivery_lead_time'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/shipment_line_items'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/stock_transfers'
                }
              },
              available_shipping_methods: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/available_shipping_methods',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/available_shipping_methods'
                }
              },
              carrier_accounts: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/carrier_accounts',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/carrier_accounts'
                }
              },
              parcels: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/parcels',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/parcels'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/events'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/YpLwCnNQgY/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'PabvCpOxRy',
            type: 'shipments',
            links: {
              self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy'
            },
            attributes: {
              number: '2485862/S/002',
              status: 'shipped',
              currency_code: 'EUR',
              cost_amount_cents: 0,
              cost_amount_float: 0.0,
              formatted_cost_amount: '$0.00',
              skus_count: 1,
              selected_rate_id: null,
              rates: [],
              purchase_error_code: null,
              purchase_error_message: null,
              get_rates_errors: [],
              get_rates_started_at: null,
              get_rates_completed_at: null,
              purchase_started_at: null,
              purchase_completed_at: null,
              purchase_failed_at: null,
              on_hold_at: null,
              picking_at: '2023-05-16T14:18:35.559Z',
              packing_at: '2023-05-16T14:20:24.459Z',
              ready_to_ship_at: '2023-05-16T14:21:43.665Z',
              shipped_at: '2023-05-16T14:22:42.632Z',
              created_at: '2023-05-16T11:06:07.711Z',
              updated_at: '2023-05-16T14:22:42.633Z',
              reference: null,
              reference_origin: null,
              metadata: {}
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/order'
                }
              },
              shipping_category: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_category',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_category'
                }
              },
              stock_location: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_location',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_location'
                }
              },
              origin_address: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/origin_address',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/origin_address'
                }
              },
              shipping_address: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_address',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_address'
                }
              },
              shipping_method: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipping_method',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipping_method'
                }
              },
              delivery_lead_time: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/delivery_lead_time',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/delivery_lead_time'
                }
              },
              shipment_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/shipment_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/shipment_line_items'
                }
              },
              stock_line_items: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_line_items',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_line_items'
                }
              },
              stock_transfers: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/stock_transfers',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/stock_transfers'
                }
              },
              available_shipping_methods: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/available_shipping_methods',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/available_shipping_methods'
                }
              },
              carrier_accounts: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/carrier_accounts',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/carrier_accounts'
                }
              },
              parcels: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/parcels',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/parcels'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/attachments'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/events'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/shipments/PabvCpOxRy/versions'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'nKZkPUDBVj',
            type: 'authorizations',
            links: {
              self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj'
            },
            attributes: {
              number: '2485862/T/001',
              currency_code: 'EUR',
              amount_cents: 15400,
              amount_float: 154.0,
              formatted_amount: '€154,00',
              succeeded: true,
              message: 'Success!',
              error_code: null,
              error_detail: null,
              token: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
              gateway_transaction_id: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
              created_at: '2023-05-16T11:06:21.964Z',
              updated_at: '2023-05-16T11:06:21.964Z',
              reference: null,
              reference_origin: null,
              metadata: {},
              cvv_code: null,
              cvv_message: null,
              avs_code: null,
              avs_message: null,
              fraud_review: null,
              capture_amount_cents: 0,
              capture_amount_float: 0.0,
              formatted_capture_amount: '€0,00',
              capture_balance_cents: 0,
              capture_balance_float: 0.0,
              formatted_capture_balance: '€0,00',
              void_balance_cents: 15400,
              void_balance_float: 154.0,
              formatted_void_balance: '€154,00'
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/order'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/attachments'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/versions'
                }
              },
              captures: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/captures',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/captures'
                }
              },
              voids: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/voids',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/voids'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/authorizations/nKZkPUDBVj/events'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'kyAnxUgegE',
            type: 'captures',
            links: {
              self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE'
            },
            attributes: {
              number: '2485862/T/002',
              currency_code: 'EUR',
              amount_cents: 15400,
              amount_float: 154.0,
              formatted_amount: '€154,00',
              succeeded: true,
              message: 'Success!',
              error_code: null,
              error_detail: null,
              token: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
              gateway_transaction_id: 'pi_3N8LhsK5j6INEBBI0JicoLOo',
              created_at: '2023-05-16T14:18:35.368Z',
              updated_at: '2023-05-16T14:18:35.368Z',
              reference: null,
              reference_origin: null,
              metadata: {},
              refund_amount_cents: 15400,
              refund_amount_float: 154.0,
              formatted_refund_amount: '€154,00',
              refund_balance_cents: 15400,
              refund_balance_float: 154.0,
              formatted_refund_balance: '€154,00'
            },
            relationships: {
              order: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/order',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/order'
                }
              },
              attachments: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/attachments',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/attachments'
                }
              },
              versions: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/versions',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/versions'
                }
              },
              reference_authorization: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/reference_authorization',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/reference_authorization'
                }
              },
              refunds: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/refunds',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/refunds'
                }
              },
              events: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/relationships/events',
                  related:
                    'https://alessani.commercelayer.co/api/captures/kyAnxUgegE/events'
                }
              }
            },
            meta: { mode: 'test', organization_id: 'WXlEOFrjnr' }
          },
          {
            id: 'EqGrksxWNW',
            type: 'attachments',
            links: {
              self: 'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW'
            },
            attributes: {
              name: 'M. Montalbano',
              description: 'Ehi there!',
              url: null,
              created_at: '2023-07-20T13:58:52.184Z',
              updated_at: '2023-07-20T13:58:52.184Z',
              reference: null,
              reference_origin: 'app-orders--note',
              metadata: {}
            },
            relationships: {
              attachable: {
                links: {
                  self: 'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW/relationships/attachable',
                  related:
                    'https://alessani.commercelayer.co/api/attachments/EqGrksxWNW/attachable'
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

export default [orderDetail, orderList]
