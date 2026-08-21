import type { DeliveryLeadTime, Shipment } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetShipmentsParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
}

export interface GetShipmentsResult {
  shipments: Shipment[]
  deliveryLeadTimes: DeliveryLeadTime[]
}

/**
 * Retrieve all shipments and delivery lead times for a given order.
 *
 * Fetches the order with all necessary shipment includes and paginates through
 * all delivery lead times in parallel.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} orderId - The ID of the order whose shipments to retrieve.
 * @returns {Promise<GetShipmentsResult>} - The list of shipments and delivery lead times.
 */
export async function getShipments({
  accessToken,
  interceptors,
  orderId,
}: GetShipmentsParams): Promise<GetShipmentsResult> {
  const sdk = getSdk({ accessToken, interceptors })

  const [order, allDeliveryLeadTimes] = await Promise.all([
    sdk.orders.retrieve(orderId, {
      include: [
        "shipments.available_shipping_methods",
        "shipments.stock_line_items.line_item",
        "shipments.shipping_method",
        "shipments.stock_transfers.line_item",
        "shipments.stock_location",
        "shipments.parcels.parcel_line_items",
      ],
      fields: { orders: ["shipments"] },
    }),
    (async (): Promise<DeliveryLeadTime[]> => {
      let result: DeliveryLeadTime[] = []
      let currentPage = 1
      let totalPages = 1
      do {
        const response = await sdk.delivery_lead_times.list({
          include: ["shipping_method", "stock_location"],
          pageNumber: currentPage,
        })
        result = result.concat(response)
        totalPages = response.meta.pageCount
        currentPage++
      } while (currentPage <= totalPages)
      return result
    })(),
  ])

  return {
    shipments: order.shipments ?? [],
    deliveryLeadTimes: allDeliveryLeadTimes,
  }
}
