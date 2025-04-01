import type { ListResponse, Price, QueryParamsList } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

type GetPricesParams = RequestConfig & QueryParamsList<Price>

export async function getPrices({
  accessToken,
  ...params
}: GetPricesParams): Promise<ListResponse<Price>> {
  const sdk = getSdk({ accessToken })
  return await sdk.prices.list(params)
}
