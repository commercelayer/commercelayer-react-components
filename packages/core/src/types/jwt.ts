export interface Jwt {
  organization: Organization
  application: Application
  market: Market
  owner: Owner
  scope: string
  exp: number
  test: boolean
  rand: number
  iat: number
  iss: string
}

interface Application {
  id: string
  kind: string
  public: boolean
}

interface Market {
  id: string[]
  price_list_id: string
  stock_location_ids: string[]
  geocoder_id: null
  allows_external_prices: boolean
}

interface Organization {
  id: string
  slug: string
  enterprise: boolean
  region: string
}

interface Owner {
  id: string
  type: string
}
