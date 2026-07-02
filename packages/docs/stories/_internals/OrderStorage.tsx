/* eslint-disable @typescript-eslint/no-misused-promises */

import type { CommerceLayerClient } from "@commercelayer/sdk"
import { useEffect, useState } from "react"
import OrderStorageComponent from "#components/orders/OrderStorage"
import useCommerceLayer from "#hooks/useCommerceLayer"
import useOrderContainer from "#hooks/useOrderContainer"

export const OrderStorage = ({
  persistKey,
  children,
}: {
  persistKey: string
  children: React.ReactNode
}): JSX.Element => {
  const [orderId, setOrderId] = useState(localStorage.getItem(persistKey))
  const { sdkClient, accessToken } = useCommerceLayer()
  const cl =
    accessToken != null && accessToken !== "" && sdkClient != null ? sdkClient() : undefined

  useEffect(() => {
    if (cl != null && orderId == null) {
      createOrderWithItems(cl).then((orderId) => {
        setOrderId(orderId)
        localStorage.setItem(persistKey, orderId)
      })
    }
  }, [cl, orderId, persistKey])

  if (cl == null || orderId == null) {
    return <div />
  }

  return <OrderStorageComponent persistKey={persistKey}>{children}</OrderStorageComponent>
}

export const AddSampleItems = (): JSX.Element => {
  const { sdkClient, accessToken } = useCommerceLayer()
  const { order, addToCart } = useOrderContainer()
  const cl = accessToken != null && accessToken !== "" && sdkClient()

  if (cl == null || cl === false || order == null) return <div>loading...</div>

  return (
    <div>
      <p className="mb-4">Cart is empty</p>
      <button
        type="button"
        onClick={async () => {
          await addToCart({
            skuCode: "5PANECAP9D9CA1FFFFFFXXXX",
            quantity: 2,
          })
          await addToCart({
            skuCode: "BACKPACK000000FFFFFFXXXX",
            quantity: 3,
          })
        }}
        className="py-2 px-4 bg-black text-white rounded text-sm"
      >
        Click me to fill cart with sample items
      </button>
    </div>
  )
}

async function createOrderWithItems(cl: CommerceLayerClient): Promise<string> {
  const order = await cl.orders.create({
    language_code: "en",
  })
  await fillOrder(order.id, cl)
  return order.id
}

async function fillOrder(orderId: string, cl: CommerceLayerClient): Promise<void> {
  await cl.line_items.create({
    item_type: "skus",
    sku_code: "5PANECAP9D9CA1FFFFFFXXXX",
    quantity: 2,
    order: cl.orders.relationship(orderId),
  })

  await cl.line_items.create({
    item_type: "skus",
    sku_code: "BACKPACK000000FFFFFFXXXX",
    quantity: 3,
    order: cl.orders.relationship(orderId),
  })
}
