/**
 * API: /api/customers/kwyehmWLpO/?include=orders
 */
export const customerOrdersEmpty = {
  data: {
    id: 'MQxqWhJMgk',
    type: 'customers',
    links: {
      self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk'
    },
    attributes: {
      email: 'demo@commercelayer.io',
      status: 'prospect',
      has_password: true,
      created_at: '2021-04-27T08:38:00.314Z',
      updated_at: '2022-12-12T15:54:25.534Z',
      reference: '',
      reference_origin: '',
      metadata: {}
    },
    relationships: {
      customer_group: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/customer_group',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/customer_group'
        }
      },
      customer_addresses: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/customer_addresses',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/customer_addresses'
        }
      },
      customer_payment_sources: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/customer_payment_sources',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/customer_payment_sources'
        }
      },
      customer_subscriptions: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/customer_subscriptions',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/customer_subscriptions'
        }
      },
      orders: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/orders',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/orders'
        },
        data: [{ type: 'orders', id: 'NpyAhVkBBL' }]
      },
      order_subscriptions: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/order_subscriptions',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/order_subscriptions'
        }
      },
      returns: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/returns',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/returns'
        }
      },
      sku_lists: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/sku_lists',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/sku_lists'
        }
      },
      attachments: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/attachments',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/attachments'
        }
      },
      events: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/relationships/events',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/MQxqWhJMgk/events'
        }
      }
    },
    meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
  },
  included: [
    {
      id: 'NpyAhVkBBL',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL'
      },
      attributes: {
        number: 2454731,
        autorefresh: true,
        status: 'pending',
        payment_status: 'unpaid',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: true,
        customer_email: 'demo@commercelayer.io',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: null,
        freight_taxable: null,
        requires_billing_info: true,
        country_code: null,
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 1500,
        subtotal_amount_float: 15,
        formatted_subtotal_amount: '€15,00',
        shipping_amount_cents: 0,
        shipping_amount_float: 0,
        formatted_shipping_amount: '€0,00',
        payment_method_amount_cents: 0,
        payment_method_amount_float: 0,
        formatted_payment_method_amount: '€0,00',
        discount_amount_cents: 0,
        discount_amount_float: 0,
        formatted_discount_amount: '€0,00',
        adjustment_amount_cents: 0,
        adjustment_amount_float: 0,
        formatted_adjustment_amount: '€0,00',
        gift_card_amount_cents: 0,
        gift_card_amount_float: 0,
        formatted_gift_card_amount: '€0,00',
        total_tax_amount_cents: 0,
        total_tax_amount_float: 0,
        formatted_total_tax_amount: '€0,00',
        subtotal_tax_amount_cents: 0,
        subtotal_tax_amount_float: 0,
        formatted_subtotal_tax_amount: '€0,00',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 1500,
        total_amount_float: 15,
        formatted_total_amount: '€15,00',
        total_taxable_amount_cents: 1500,
        total_taxable_amount_float: 15,
        formatted_total_taxable_amount: '€15,00',
        subtotal_taxable_amount_cents: 1500,
        subtotal_taxable_amount_float: 15,
        formatted_subtotal_taxable_amount: '€15,00',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 1500,
        total_amount_with_taxes_float: 15,
        formatted_total_amount_with_taxes: '€15,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 0,
        tax_calculations_count: 0,
        payment_source_details: null,
        token: '388631fa1b6af42e7b4801db670155f3',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: null,
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: null,
        fulfillment_updated_at: null,
        refreshed_at: null,
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-01T16:39:19.454Z',
        updated_at: '2022-12-01T16:40:01.413Z',
        reference: '',
        reference_origin: '',
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NpyAhVkBBL/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    }
  ]
}
