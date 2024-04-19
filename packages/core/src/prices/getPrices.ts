import type { ListResponse, Price, QueryParamsList } from '@commercelayer/sdk'
import { getSdk } from 'src/sdk/index.js'
import type { RequestConfig } from 'src/types/index.js'

type GetPricesParams = RequestConfig & QueryParamsList<Price>

export async function getPrices({
  accessToken,
  ...params
}: GetPricesParams): Promise<ListResponse<Price>> {
  const sdk = getSdk({ accessToken })
  return await sdk.prices.list(params)
}
