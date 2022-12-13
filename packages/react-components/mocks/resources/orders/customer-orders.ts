/**
 * API: /api/customers/kwyehmWLpO/?include=orders
 */
export const customerOrders = {
  data: {
    id: 'kwyehmWLpO',
    type: 'customers',
    links: {
      self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO'
    },
    attributes: {
      email: 'tony@iron.man',
      status: 'repeat',
      has_password: true,
      created_at: '2022-12-02T09:29:42.173Z',
      updated_at: '2022-12-09T17:09:46.872Z',
      reference: '',
      reference_origin: '',
      metadata: {}
    },
    relationships: {
      customer_group: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/customer_group',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/customer_group'
        }
      },
      customer_addresses: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/customer_addresses',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/customer_addresses'
        }
      },
      customer_payment_sources: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/customer_payment_sources',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/customer_payment_sources'
        }
      },
      customer_subscriptions: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/customer_subscriptions',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/customer_subscriptions'
        }
      },
      orders: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/orders',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/orders'
        },
        data: [
          { type: 'orders', id: 'qJZYhBMeDr' },
          { type: 'orders', id: 'wkykhjYmBy' },
          { type: 'orders', id: 'weWdhoaYeY' },
          { type: 'orders', id: 'wLmohdKBzz' },
          { type: 'orders', id: 'qjobhrmMda' },
          { type: 'orders', id: 'NvoJhMOZQv' },
          { type: 'orders', id: 'qdyBhGZLeE' },
          { type: 'orders', id: 'qOBnhVabXe' },
          { type: 'orders', id: 'NVlXhyBLja' },
          { type: 'orders', id: 'NMWYhbYaBy' },
          { type: 'orders', id: 'PbQLhypYdr' },
          { type: 'orders', id: 'qAezhrQjpY' },
          { type: 'orders', id: 'PrnYhAerQJ' },
          { type: 'orders', id: 'PoKkhYJdBz' }
        ]
      },
      order_subscriptions: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/order_subscriptions',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/order_subscriptions'
        }
      },
      returns: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/returns',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/returns'
        }
      },
      sku_lists: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/sku_lists',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/sku_lists'
        }
      },
      attachments: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/attachments',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/attachments'
        }
      },
      events: {
        links: {
          self: 'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/relationships/events',
          related:
            'https://the-blue-brand-3.commercelayer.co/api/customers/kwyehmWLpO/events'
        }
      }
    },
    meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
  },
  included: [
    {
      id: 'qJZYhBMeDr',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr'
      },
      attributes: {
        number: 2454744,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '5106b316997ac0ea1db87e212aaf3842',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T09:42:44.007Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T09:42:43.933Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T09:42:33.625Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T09:42:22.223Z',
        updated_at: '2022-12-02T09:42:44.019Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qJZYhBMeDr/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'wkykhjYmBy',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy'
      },
      attributes: {
        number: 2454745,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: 'bab9a940193c21db7732f8d6ce59b7b2',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T09:43:26.741Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T09:43:26.699Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T09:43:14.603Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T09:42:57.170Z',
        updated_at: '2022-12-02T09:43:26.747Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wkykhjYmBy/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'weWdhoaYeY',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY'
      },
      attributes: {
        number: 2454747,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '17aadf0c864c635bb2341acd88df1863',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T09:44:29.025Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T09:44:28.969Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T09:44:18.906Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T09:44:09.090Z',
        updated_at: '2022-12-02T09:44:29.033Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/weWdhoaYeY/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'wLmohdKBzz',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz'
      },
      attributes: {
        number: 2454748,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '92602b939382429cbebac46d3a15caa5',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:14:42.933Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:14:42.890Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:14:33.197Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:14:15.956Z',
        updated_at: '2022-12-02T10:14:42.941Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/wLmohdKBzz/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'qjobhrmMda',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda'
      },
      attributes: {
        number: 2454752,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '714b4c274462db2293dd28ee82dfac46',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:19:03.215Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:19:03.172Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:18:53.080Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:18:37.220Z',
        updated_at: '2022-12-02T10:19:03.222Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qjobhrmMda/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'NvoJhMOZQv',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv'
      },
      attributes: {
        number: 2454749,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: 'b0e5b15d257a783e8d8d08d13a230015',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:15:07.749Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:15:07.704Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:14:58.474Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:14:47.957Z',
        updated_at: '2022-12-02T10:15:07.755Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NvoJhMOZQv/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'qdyBhGZLeE',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE'
      },
      attributes: {
        number: 2454750,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: 'd1ddf5a4ebd81453bb445c44727c2eb2',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:16:32.250Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:16:32.200Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:16:21.270Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:15:55.592Z',
        updated_at: '2022-12-02T10:16:32.257Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qdyBhGZLeE/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'qOBnhVabXe',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe'
      },
      attributes: {
        number: 2454751,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '322ec4f42342d295a9b6776ad7ca1454',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:18:11.950Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:18:11.907Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:18:00.818Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:17:51.103Z',
        updated_at: '2022-12-02T10:18:11.956Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qOBnhVabXe/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'NVlXhyBLja',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja'
      },
      attributes: {
        number: 2454753,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '077a778c2cb32031da34a2fb3e401256',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:22:38.535Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:22:38.487Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:22:21.723Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:22:04.198Z',
        updated_at: '2022-12-02T10:22:38.549Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NVlXhyBLja/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'NMWYhbYaBy',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy'
      },
      attributes: {
        number: 2454754,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 6,
        payment_source_details: { type: 'wire_transfer' },
        token: '9d772e917c6cece5eb57750e2bc966bc',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:23:25.812Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:23:25.770Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:23:04.326Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:22:48.891Z',
        updated_at: '2022-12-02T10:23:25.820Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/NMWYhbYaBy/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'PbQLhypYdr',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr'
      },
      attributes: {
        number: 2454755,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 5,
        payment_source_details: { type: 'wire_transfer' },
        token: 'e863b6888a844b4f87c120e934f7c1b7',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T10:24:06.271Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T10:24:06.228Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T10:23:48.380Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T10:23:31.900Z',
        updated_at: '2022-12-02T10:24:06.277Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PbQLhypYdr/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'qAezhrQjpY',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY'
      },
      attributes: {
        number: 2454757,
        autorefresh: true,
        status: 'pending',
        payment_status: 'unpaid',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: true,
        customer_email: 'tony@iron.man',
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
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 3500,
        total_taxable_amount_float: 35,
        formatted_total_taxable_amount: '€35,00',
        subtotal_taxable_amount_cents: 3500,
        subtotal_taxable_amount_float: 35,
        formatted_subtotal_taxable_amount: '€35,00',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
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
        token: '451c37542c6b185ba2ee9fa6227418b6',
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
        created_at: '2022-12-02T15:39:43.852Z',
        updated_at: '2022-12-02T15:39:44.093Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/qAezhrQjpY/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'PrnYhAerQJ',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ'
      },
      attributes: {
        number: 2454743,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 5,
        payment_source_details: { type: 'wire_transfer' },
        token: 'c58819deeb5066aa6f8df76ee116a8c7',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T09:42:13.739Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T09:42:13.674Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T09:40:50.311Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T09:40:37.940Z',
        updated_at: '2022-12-02T09:42:13.747Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PrnYhAerQJ/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    },
    {
      id: 'PoKkhYJdBz',
      type: 'orders',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz'
      },
      attributes: {
        number: 2454746,
        autorefresh: true,
        status: 'placed',
        payment_status: 'authorized',
        fulfillment_status: 'unfulfilled',
        guest: false,
        editable: false,
        customer_email: 'tony@iron.man',
        language_code: 'en',
        currency_code: 'EUR',
        tax_included: true,
        tax_rate: '0.22',
        freight_taxable: false,
        requires_billing_info: true,
        country_code: 'IT',
        shipping_country_code_lock: null,
        coupon_code: null,
        gift_card_code: null,
        gift_card_or_coupon_code: null,
        subtotal_amount_cents: 3500,
        subtotal_amount_float: 35,
        formatted_subtotal_amount: '€35,00',
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
        total_tax_amount_cents: 631,
        total_tax_amount_float: 6.31,
        formatted_total_tax_amount: '€6,31',
        subtotal_tax_amount_cents: 631,
        subtotal_tax_amount_float: 6.31,
        formatted_subtotal_tax_amount: '€6,31',
        shipping_tax_amount_cents: 0,
        shipping_tax_amount_float: 0,
        formatted_shipping_tax_amount: '€0,00',
        payment_method_tax_amount_cents: 0,
        payment_method_tax_amount_float: 0,
        formatted_payment_method_tax_amount: '€0,00',
        adjustment_tax_amount_cents: 0,
        adjustment_tax_amount_float: 0,
        formatted_adjustment_tax_amount: '€0,00',
        total_amount_cents: 3500,
        total_amount_float: 35,
        formatted_total_amount: '€35,00',
        total_taxable_amount_cents: 2869,
        total_taxable_amount_float: 28.69,
        formatted_total_taxable_amount: '€28,69',
        subtotal_taxable_amount_cents: 2869,
        subtotal_taxable_amount_float: 28.69,
        formatted_subtotal_taxable_amount: '€28,69',
        shipping_taxable_amount_cents: 0,
        shipping_taxable_amount_float: 0,
        formatted_shipping_taxable_amount: '€0,00',
        payment_method_taxable_amount_cents: 0,
        payment_method_taxable_amount_float: 0,
        formatted_payment_method_taxable_amount: '€0,00',
        adjustment_taxable_amount_cents: 0,
        adjustment_taxable_amount_float: 0,
        formatted_adjustment_taxable_amount: '€0,00',
        total_amount_with_taxes_cents: 3500,
        total_amount_with_taxes_float: 35,
        formatted_total_amount_with_taxes: '€35,00',
        fees_amount_cents: 0,
        fees_amount_float: 0,
        formatted_fees_amount: '€0,00',
        duty_amount_cents: null,
        duty_amount_float: null,
        formatted_duty_amount: null,
        skus_count: 1,
        line_item_options_count: 0,
        shipments_count: 1,
        tax_calculations_count: 4,
        payment_source_details: { type: 'wire_transfer' },
        token: '6f41ae37855f29966d5cd398bfe692c2',
        cart_url: null,
        return_url: null,
        terms_url: null,
        privacy_url: null,
        checkout_url: null,
        placed_at: '2022-12-02T09:43:59.824Z',
        approved_at: null,
        cancelled_at: null,
        payment_updated_at: '2022-12-02T09:43:59.777Z',
        fulfillment_updated_at: null,
        refreshed_at: '2022-12-02T09:43:49.102Z',
        archived_at: null,
        expires_at: null,
        created_at: '2022-12-02T09:43:37.755Z',
        updated_at: '2022-12-02T09:43:59.832Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        market: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/market',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/market'
          }
        },
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/customer'
          }
        },
        shipping_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/shipping_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/shipping_address'
          }
        },
        billing_address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/billing_address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/billing_address'
          }
        },
        available_payment_methods: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/available_payment_methods',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/available_payment_methods'
          }
        },
        available_customer_payment_sources: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/available_customer_payment_sources',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/available_customer_payment_sources'
          }
        },
        available_free_skus: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/available_free_skus',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/available_free_skus'
          }
        },
        available_free_bundles: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/available_free_bundles',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/available_free_bundles'
          }
        },
        payment_method: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/payment_method',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/payment_method'
          }
        },
        payment_source: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/payment_source',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/payment_source'
          }
        },
        line_items: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/line_items',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/line_items'
          }
        },
        shipments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/shipments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/shipments'
          }
        },
        transactions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/transactions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/transactions'
          }
        },
        authorizations: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/authorizations',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/authorizations'
          }
        },
        captures: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/captures',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/captures'
          }
        },
        voids: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/voids',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/voids'
          }
        },
        refunds: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/refunds',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/refunds'
          }
        },
        order_subscriptions: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/order_subscriptions',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/order_subscriptions'
          }
        },
        order_copies: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/order_copies',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/order_copies'
          }
        },
        attachments: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/attachments',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/attachments'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/orders/PoKkhYJdBz/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    }
  ]
}
