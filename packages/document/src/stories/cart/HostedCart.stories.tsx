import { HostedCart, Order } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"
import { OrderStorage as OrderStorageHelper } from "../_internals/OrderStorage"

function HostedCartDocsPage(): JSX.Element {
  return (
    <>
      <h1>HostedCart</h1>
      <p>
        <code>{"<HostedCart>"}</code> embeds the Commerce Layer hosted cart
        micro-frontend as an <code>{"<iframe>"}</code> inside your page. It
        automatically resolves the cart URL from the access token and the current
        order.
      </p>
      <p>
        By default it renders as an <strong>inline cart</strong> — the iframe
        fills the available container width while the height adjusts to its
        content. For the slide-in panel variant, see{" "}
        <strong>Components/Cart/MiniCart</strong>.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<Order>"}</code> (wrapped in{" "}
          <code>{"<OrderStorage>"}</code>). Requires a parent{" "}
          <code>{"<CommerceLayer>"}</code> context for the access token.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import {
  CommerceLayer,
  OrderStorage,
  Order,
  HostedCart,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <OrderStorage persistKey="my-cart">
    <Order>
      <HostedCart />
    </Order>
  </OrderStorage>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Default — inline cart</h2>
      <p>
        Renders as an inline <code>{"<iframe>"}</code> that fills the container
        width. The height adjusts automatically to the cart content via{" "}
        <code>iframe-resizer</code>.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Custom domain</h2>
      <p>
        Use <code>customDomain</code> to point to a forked cart application
        instead of the default Commerce Layer hosted micro-frontend.
      </p>
      <Canvas of={CustomDomain} />
    </>
  )
}

const meta = {
  title: "Components/Cart/HostedCart",
  component: HostedCart,
  parameters: {
    docs: {
      page: HostedCartDocsPage,
    },
  },
  argTypes: {
    customDomain: {
      control: "text",
      description:
        "Domain of a forked cart application. Overrides the default `<slug>.commercelayer.app` hostname.",
    },
    style: {
      control: "object",
      description:
        "Style overrides for each part of the component. Accepts an object with keys `cart`, `container`, `background`, `icon`, and `iconContainer` — each a `CSSProperties` object.",
    },
  },
} satisfies Meta<typeof HostedCart>

export default meta
type Story = StoryObj<typeof meta>

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorageHelper persistKey="cl-examples-hostedCart">
        <Order>{children}</Order>
      </OrderStorageHelper>
    </CommerceLayer>
  )
}

/**
 * The default inline cart renders an `<iframe>` that fills the container width.
 * The iframe height is managed automatically by `iframe-resizer`.
 */
export const Default: Story = {
  name: "Default — inline cart",
  args: {},
  render: (args) => (
    <Wrapper>
      <HostedCart {...args} />
    </Wrapper>
  ),
}

/**
 * Pass `customDomain` to load a self-hosted or forked cart application
 * instead of the default Commerce Layer hosted micro-frontend.
 */
export const CustomDomain: Story = {
  name: "Custom domain",
  args: {
    customDomain: "cart.my-store.com",
  },
  render: (args) => (
    <Wrapper>
      <HostedCart {...args} />
    </Wrapper>
  ),
}
