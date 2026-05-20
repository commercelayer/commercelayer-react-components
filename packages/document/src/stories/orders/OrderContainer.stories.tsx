import {
  Order,
  OrderContainer,
  OrderNumber,
  TotalAmount,
} from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function OrderContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>OrderContainer</h1>
      <span title="Deprecated" type="warning">
        <p>
          Use <code>{"<Order>"}</code> instead — it has the same API and is a drop-in replacement.
          See <strong>Orders/Order</strong> for the recommended pattern.{" "}
          <code>{"<OrderContainer>"}</code> will be removed in the next major version.
        </p>
      </span>
      <p>
        <code>{"<OrderContainer>"}</code> fetches an order by ID and stores it in context for its
        children. It also fires the optional <code>fetchOrder</code> callback every time the order
        is updated.
      </p>
      <ArgTypes />
      <hr />
      <h2>Migration guide</h2>
      <p>
        <strong>Before (deprecated):</strong>
      </p>
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, OrderContainer, OrderNumber, TotalAmount } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <OrderContainer orderId="KaeheROdbp">
    <div>Order #<OrderNumber /></div>
    <div>Total: <TotalAmount /></div>
  </OrderContainer>
</CommerceLayer>
`}
      />
      <p>
        <strong>After (recommended):</strong>
      </p>
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, Order, OrderNumber, TotalAmount } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <Order orderId="KaeheROdbp">
    <div>Order #<OrderNumber /></div>
    <div>Total: <TotalAmount /></div>
  </Order>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Example</h2>
      <Canvas of={OrderContainerStory} />
    </>
  )
}

const meta = {
  title: "Components/Orders/OrderContainer",
  component: OrderContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: OrderContainerDocsPage,
    },
  },
  argTypes: {
    orderId: {
      control: "text",
      description: "ID of the order to fetch.",
    },
    metadata: {
      control: "object",
      description: "Metadata key-value pairs added when a new order is created.",
    },
    attributes: {
      control: "object",
      description:
        "Order attributes applied when the order is created or updated (e.g. `language_code`, `coupon_code`).",
    },
    fetchOrder: {
      control: false,
      description:
        "Callback fired every time the order is updated. Receives the updated `Order` SDK object.",
    },
    children: {
      control: false,
      description:
        "Accepts order display components such as `<OrderNumber>`, `<TotalAmount>`, `<AddToCartButton>`, etc.",
    },
  },
} satisfies Meta<typeof OrderContainer>

export default meta
type Story = StoryObj<typeof meta>

export const OrderContainerStory: Story = {
  name: "OrderContainer — display order details",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <OrderContainer orderId="KaeheROdbp">
        <div>
          Order #<OrderNumber />
        </div>
        <div>
          Total: <TotalAmount />
        </div>
      </OrderContainer>
    </CommerceLayer>
  ),
}
