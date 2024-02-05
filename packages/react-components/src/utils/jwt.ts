import { jwtDecode } from 'jwt-decode'

interface JWT {
  application: {
    id: string
    kind: 'sales_channel' | 'integration'
    public: boolean
  }
  exp: number
  market: {
    id: string[]
    price_list_id: string
    stock_location_ids: string[]
    geocoder_id: null | string
    allows_external_prices: boolean
  }
  organization: {
    id: string
    slug: string
  }
  owner: { id: string; type: 'Customer' }
  rand: number
  test: boolean
}

export function jwt(accessToken: string): JWT {
  return jwtDecode<JWT>(accessToken)
}
