import { CartLink, HostedCart, Order } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type JSX } from "react"
import CommerceLayer from "../_internals/CommerceLayer"
import { OrderStorage as OrderStorageHelper } from "../_internals/OrderStorage"

function CartLinkDocsPage(): JSX.Element {
  return (
    <>
      <h1>CartLink</h1>
      <p>
        <code>{"<CartLink>"}</code> generates a link to the Commerce Layer hosted cart
        micro-frontend. Clicking it navigates the customer to their cart, or — when{" "}
        <code>type="mini"</code> is set — opens the{" "}
        <code>{"<HostedCart type=\"mini\">"}</code> slide-in panel instead.
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
  CartLink,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <OrderStorage persistKey="my-cart">
    <Order>
      <CartLink label="View cart" />
    </Order>
  </OrderStorage>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Default — link to hosted cart</h2>
      <p>
        Renders an <code>{"<a>"}</code> tag that navigates to the Commerce Layer hosted cart
        application when clicked.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Mini cart trigger</h2>
      <p>
        Set <code>type="mini"</code> to publish the <code>"open-cart"</code> event on click
        instead of navigating. Place a <code>{'<HostedCart type="mini">'}</code> on the same page
        to receive the event and open the slide-in panel.
      </p>
      <Canvas of={MiniCartTrigger} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to take full control of the rendered trigger. The
        render prop receives <code>href</code>, <code>handleClick</code>, <code>orderId</code>, and{" "}
        <code>accessToken</code>.
      </p>
      <Canvas of={ChildrenProps} />
    </>
  )
}

const meta = {
  title: "Components/Cart/CartLink",
  component: CartLink,
  parameters: {
    docs: {
      page: CartLinkDocsPage,
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Label text or element rendered inside the link.",
    },
    type: {
      control: "select",
      options: [undefined, "mini"],
      description:
        'When set to `"mini"` the link publishes the `"open-cart"` event on click instead of navigating, triggering a `<HostedCart type="mini">` panel on the same page.',
    },
    customDomain: {
      control: "text",
      description:
        "Domain of a forked cart application. Overrides the default `<slug>.commercelayer.app` hostname.",
    },
    children: {
      control: false,
      description:
        "Render prop receiving `{ href, handleClick, orderId, accessToken }` for a fully custom trigger element.",
    },
  },
} satisfies Meta<typeof CartLink>

export default meta
type Story = StoryObj<typeof meta>

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorageHelper persistKey="cl-examples-cartLink">
        <Order>{children}</Order>
      </OrderStorageHelper>
    </CommerceLayer>
  )
}

/**
 * The default `<CartLink>` renders an `<a>` tag that navigates to the Commerce
 * Layer hosted cart application when clicked.
 */
export const Default: Story = {
  name: "Default — link to hosted cart",
  args: {
    label: "View cart",
    className: "text-blue-600 underline hover:text-blue-800",
  },
  render: (args) => (
    <Wrapper>
      <CartLink {...args} />
    </Wrapper>
  ),
}

/**
 * Set `type="mini"` so clicking the link publishes the `"open-cart"` event
 * instead of navigating. A `<HostedCart type="mini">` on the same page
 * listens for this event and opens the slide-in panel.
 */
export const MiniCartTrigger: Story = {
  name: "Mini cart trigger",
  decorators: [
    (Story) => (
      <div style={{ minHeight: "500px" }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <Wrapper>
        <CartLink
          type="mini"
          label="Open mini cart"
          className="px-4 py-2 bg-black text-white rounded text-sm"
        />
        <HostedCart
          type="mini"
          open={isOpen}
          handleOpen={() => setIsOpen((o) => !o)}
        />
      </Wrapper>
    )
  },
}

/**
 * Use the `children` render prop to fully control the trigger element.
 * The `href` and `handleClick` props are provided by `CartLink` and wire
 * up navigation automatically.
 */
export const ChildrenProps: Story = {
  name: "Children props (render prop)",
  render: () => (
    <Wrapper>
      <CartLink>
        {({ href, handleClick, orderId }) => (
          <a
            href={href}
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            🛒 Cart{orderId != null ? ` — order ${orderId}` : ""}
          </a>
        )}
      </CartLink>
    </Wrapper>
  ),
}
