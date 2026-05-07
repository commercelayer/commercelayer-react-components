import {
  Order,
  OrderNumber,
  TotalAmount,
  SubTotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
} from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Orders/Stories",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const OrderStory: Story = {
  name: "Order — display order details",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order orderId="KaeheROdbp">
        <div style={{ display: "grid", gap: 8, minWidth: 240 }}>
          <div>
            Order #<OrderNumber />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <SubTotalAmount />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Discount</span>
            <DiscountAmount />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Shipping</span>
            <ShippingAmount />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Taxes</span>
            <TaxesAmount />
          </div>
          <hr />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <TotalAmount />
          </div>
        </div>
      </Order>
    </CommerceLayer>
  ),
}

export const OrderWithCallbackStory: Story = {
  name: "Order — with fetchOrder callback",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order
        orderId="KaeheROdbp"
        fetchOrder={(order) => {
          console.log("fetchOrder: ", order)
        }}
      >
        <div>
          Order #<OrderNumber />
        </div>
        <div>
          Total: <TotalAmount />
        </div>
      </Order>
    </CommerceLayer>
  ),
}
