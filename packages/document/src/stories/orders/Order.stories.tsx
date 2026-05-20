import {
  Order,
  OrderNumber,
  TotalAmount,
  SubTotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
} from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function OrderDocsPage(): JSX.Element {
  return (
    <>
      <h1>Orders</h1>
      <p>
        The Order components let you fetch and display order data from the
        Commerce Layer API. All order components must be nested inside the{" "}
        <code>{"<CommerceLayer>"}</code> context that handles API
        authentication.
      </p>
      <p>
        Refer to the{" "}
        <a href="https://docs.commercelayer.io/core/v/api-reference/orders/object">
          Orders API reference
        </a>{" "}
        for the full list of available attributes.
      </p>
      <hr />
      <h2>Order (standalone)</h2>
      <p>
        <code>{"<Order>"}</code> is the recommended way to fetch an order and
        make it available to its children via context. Pass the{" "}
        <code>orderId</code> prop to load an existing order, or omit it to
        create a new one on demand. It can optionally receive the{" "}
        <code>orderId</code> from a parent <code>{"<OrderStorage>"}</code>{" "}
        component.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Can optionally be
          a child of <code>{"<OrderStorage>"}</code> to receive the{" "}
          <code>orderId</code> automatically.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import {
  CommerceLayer,
  Order,
  OrderNumber,
  SubTotalAmount,
  TotalAmount,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <Order orderId="KaeheROdbp" fetchOrder={(order) => console.log(order)}>
    <div>Order #<OrderNumber /></div>
    <div>Subtotal: <SubTotalAmount /></div>
    <div>Total: <TotalAmount /></div>
  </Order>
</CommerceLayer>
`}
      />
      <Canvas of={OrderStory} />
      <hr />
      <h2>Order — with fetchOrder callback</h2>
      <p>
        Use the <code>fetchOrder</code> callback to react to order updates in
        your application — for example to sync the cart badge count or trigger
        analytics events.
      </p>
      <Source
        language="jsx"
        dark
        code={`
<CommerceLayer accessToken="...">
  <Order
    orderId="KaeheROdbp"
    fetchOrder={(order) => {
      console.log('Order updated:', order)
    }}
  >
    <div>Order #<OrderNumber /></div>
    <div>Total: <TotalAmount /></div>
  </Order>
</CommerceLayer>
`}
      />
      <Canvas of={OrderWithCallbackStory} />
    </>
  )
}

const meta = {
  title: "Components/Orders/Order",
  component: Order,
  parameters: {
    layout: "centered",
    docs: {
      page: OrderDocsPage,
    },
  },
  argTypes: {
    orderId: {
      control: "text",
      description:
        "ID of the order to fetch. Omit to create a new draft order on demand.",
    },
    metadata: {
      control: "object",
      description:
        "Metadata key-value pairs added when a new order is created.",
    },
    attributes: {
      control: "object",
      description:
        "Order attributes applied when the order is created or updated (e.g. `language_code`, `coupon_code`).",
    },
    fetchOrder: {
      control: false,
      description:
        "Callback fired every time the order is updated. Receives the updated `Order` SDK object — useful for syncing cart badge counts or analytics.",
    },
    children: {
      control: false,
      description:
        "Accepts order display components such as `<OrderNumber>`, `<TotalAmount>`, `<AddToCartButton>`, etc.",
    },
  },
} satisfies Meta<typeof Order>

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
