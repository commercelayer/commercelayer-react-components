import {
  type ListResponse,
  type Price,
  prices,
  type QueryParamsList,
  type ResourcesConfig,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

type GetPricesParams = RequestConfig & QueryParamsList<Price>

export async function getPrices({
  accessToken,
  ...params
}: GetPricesParams): Promise<ListResponse<Price>> {
  getSdk({ accessToken })
  return await prices.list(params, options)
}
