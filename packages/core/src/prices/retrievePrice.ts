import type {
  ListResponse,
  Price,
  QueryParamsList,
  QueryParamsRetrieve,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrievePrice extends RequestConfig {
  id: string
}

type RetrievePriceParams = RetrievePrice & QueryParamsRetrieve<Price>

export async function retrievePrice({
  accessToken,
  id,
  ...params
}: RetrievePriceParams): Promise<Price> {
  const sdk = getSdk({ accessToken })
  return await sdk.prices.retrieve(id, params)
}
