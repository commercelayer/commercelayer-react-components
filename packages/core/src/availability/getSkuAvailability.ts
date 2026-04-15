import { type Sku, skus } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

export interface LeadTimes {
  hours: number
  days: number
}

export interface DeliveryLeadTime {
  shipping_method: {
    name: string
    reference: string
    price_amount_cents: number
    free_over_amount_cents: number
    formatted_price_amount: string
    formatted_free_over_amount: string
  }
  min: LeadTimes
  max: LeadTimes
}

export interface SkuAvailability {
  skuCode?: string
  quantity: number
  min?: LeadTimes
  max?: LeadTimes
  shipping_method?: DeliveryLeadTime["shipping_method"]
}

interface GetSkuAvailability extends RequestConfig {
  skuCode?: string
  skuId?: string
}

/**
 * Retrieve availability information for a SKU by code or ID.
 * Returns quantity and delivery lead time from the first inventory level.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} skuCode - The code of the SKU.
 * @param {string} skuId - The ID of the SKU (takes precedence over skuCode).
 * @returns {Promise<SkuAvailability | null>} - Availability info or null if not found.
 */
export async function getSkuAvailability({
  accessToken,
  skuCode,
  skuId,
  interceptors,
}: GetSkuAvailability): Promise<SkuAvailability | null> {
  getSdk({ accessToken, interceptors })
  const [sku] =
    skuId != null
      ? [{ id: skuId } as Sku]
      : skuCode != null
        ? await skus.list({
            fields: { skus: ["id"] },
            filters: { code_in: skuCode },
          })
        : []
  if (sku == null) return null
  const skuInventory = await skus.retrieve(sku.id, {
    fields: { skus: ["inventory", "code"] },
  })
  const inventory = (
    skuInventory as Sku & {
      inventory?: {
        available: boolean
        quantity: number
        levels: Array<{
          quantity: number
          delivery_lead_times: DeliveryLeadTime[]
        }>
      }
    }
  ).inventory
  if (inventory == null) return null
  const [level] = inventory.levels ?? []
  const [delivery] = level?.delivery_lead_times ?? []
  return {
    skuCode: skuInventory.code,
    quantity: inventory.quantity,
    min: delivery?.min,
    max: delivery?.max,
    shipping_method: delivery?.shipping_method,
  }
}
