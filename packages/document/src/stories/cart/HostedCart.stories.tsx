import { HostedCart, Order } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"
import {
  AddSampleItems,
  OrderStorage as OrderStorageHelper,
} from "../_internals/OrderStorage"

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
        content. Set <code>type="mini"</code> to switch to a{" "}
        <strong>slide-in mini cart</strong> panel.
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

// Inline cart
<CommerceLayer accessToken="...">
  <OrderStorage persistKey="my-cart">
    <Order>
      <HostedCart />
    </Order>
  </OrderStorage>
</CommerceLayer>

// Mini cart (slide-in panel)
<CommerceLayer accessToken="...">
  <OrderStorage persistKey="my-cart">
    <Order>
      <HostedCart type="mini" open={isOpen} handleOpen={() => setIsOpen(o => !o)} />
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
      <h2>Mini cart</h2>
      <p>
        Set <code>type="mini"</code> to render a fixed slide-in panel. Use the{" "}
        <code>open</code> prop to control visibility and{" "}
        <code>handleOpen</code> to toggle it from outside. Toggle{" "}
        <code>open</code> in the Controls panel below to preview.
      </p>
      <Canvas of={MiniCart} />
      <hr />
      <h2>Mini cart — auto-open on add to cart</h2>
      <p>
        Set <code>openAdd</code> to <code>true</code> (requires{" "}
        <code>type="mini"</code>) so the panel opens automatically whenever an
        item is added via <code>{"<AddToCartButton>"}</code>.
      </p>
      <Canvas of={MiniCartOpenAdd} />
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
    type: {
      control: "select",
      options: [undefined, "mini"],
      description:
        'Rendering mode. Leave `undefined` for an inline cart iframe, or set to `"mini"` for a fixed slide-in panel.',
    },
    open: {
      control: "boolean",
      description:
        "Controls whether the mini cart panel is open. Only applies when `type=\"mini\"`.",
    },
    openAdd: {
      control: "boolean",
      description:
        'Automatically opens the mini cart when an item is added via `<AddToCartButton>`. Only applies when `type="mini"`.',
    },
    handleOpen: {
      control: false,
      description:
        'Callback fired when the background overlay or close icon is clicked. Use this to sync `open` state from outside. Only applies when `type="mini"`.',
    },
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
 * Set `type="mini"` to render a fixed slide-in panel. Toggle the `open` control
 * to preview the open and closed states. In a real app, bind `open` and
 * `handleOpen` to local state:
 *
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * <HostedCart type="mini" open={isOpen} handleOpen={() => setIsOpen(o => !o)} />
 * ```
 */
export const MiniCart: Story = {
  name: "Mini cart",
  args: {
    type: "mini",
    open: false,
  },
  render: (args) => (
    <Wrapper>
      <HostedCart {...args} />
    </Wrapper>
  ),
}

/**
 * When `openAdd` is `true` the mini cart panel opens automatically after an
 * item is successfully added to the order via `<AddToCartButton>`. Click the
 * button below to trigger the flow.
 */
export const MiniCartOpenAdd: Story = {
  name: "Mini cart — auto-open on add",
  args: {
    type: "mini",
    openAdd: true,
    open: false,
  },
  render: (args) => (
    <Wrapper>
      <AddSampleItems />
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
