/**
 * API: /api/customer_addresses
 */
export const customerAddresses = {
  data: [
    {
      id: 'mWryXhjazO',
      type: 'customer_addresses',
      links: {
        self: 'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO'
      },
      attributes: {
        name: 'Tony Stark, St. Avenger, 16030 Anywhere GE (IT) 3222121333312222',
        created_at: '2022-12-02T09:42:13.437Z',
        updated_at: '2022-12-02T09:42:13.437Z',
        reference: null,
        reference_origin: null,
        metadata: {}
      },
      relationships: {
        customer: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/relationships/customer',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/customer'
          }
        },
        address: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/relationships/address',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/address'
          }
        },
        events: {
          links: {
            self: 'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/relationships/events',
            related:
              'https://the-blue-brand-3.commercelayer.co/api/customer_addresses/mWryXhjazO/events'
          }
        }
      },
      meta: { mode: 'test', organization_id: 'enWoxFMOnp' }
    }
  ],
  meta: { record_count: 1, page_count: 1 }
}
