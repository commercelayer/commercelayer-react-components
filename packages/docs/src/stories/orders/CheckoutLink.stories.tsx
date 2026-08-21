import { CheckoutLink, Order, OrderStorage } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"
import { OrderStorage as OrderStorageHelper } from "../_internals/OrderStorage"

function CheckoutLinkDocsPage(): JSX.Element {
  return (
    <>
      <h1>CheckoutLink</h1>
      <p>
        <code>{"<CheckoutLink>"}</code> renders a link that takes the customer to the hosted
        mfe-checkout application. By default it builds the URL from the access token and order id
        (hosted checkout). Set <code>hostedCheckout</code> to <code>false</code> to use the{" "}
        <code>checkout_url</code> attribute found on the order object instead.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<Order>"}</code> (or <code>{"<OrderStorage>"}</code> +
          <code>{"<Order>"}</code>). Requires a parent <code>{"<CommerceLayer>"}</code> context for
          the access token.
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
  CheckoutLink,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <OrderStorage persistKey="my-cart">
    <Order>
      <CheckoutLink label="Go to checkout" />
    </Order>
  </OrderStorage>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Default — hosted checkout</h2>
      <p>
        Builds a URL to the Commerce Layer hosted checkout micro-frontend using the access token and
        order id.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Using order checkout_url</h2>
      <p>
        When <code>hostedCheckout</code> is <code>false</code> the component falls back to the{" "}
        <code>checkout_url</code> attribute set on the order. Useful when you have a custom checkout
        flow configured at the order level.
      </p>
      <Canvas of={WithOrderCheckoutUrl} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to take full control of the rendered element. The
        render prop receives <code>href</code>, <code>handleClick</code>, <code>orderId</code>, and{" "}
        <code>accessToken</code>.
      </p>
      <Canvas of={ChildrenProps} />
    </>
  )
}

const meta = {
  title: "Components/Orders/CheckoutLink",
  component: CheckoutLink,
  parameters: {
    docs: {
      page: CheckoutLinkDocsPage,
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Label text or element rendered inside the link.",
    },
    hostedCheckout: {
      control: "boolean",
      description:
        "When `true` (default) the link points to the Commerce Layer hosted checkout. Set to `false` to use the order's `checkout_url` attribute instead.",
    },
    customDomain: {
      control: "text",
      description:
        "Domain of a forked checkout application. Overrides the default `<slug>.commercelayer.app` hostname.",
    },
    children: {
      control: false,
      description:
        "Render prop receiving `{ href, handleClick, orderId, accessToken, checkoutUrl }` for a fully custom trigger element.",
    },
  },
} satisfies Meta<typeof CheckoutLink>

export default meta
type Story = StoryObj<typeof meta>

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorageHelper persistKey="cl-examples-checkoutLink">
        <Order>{children}</Order>
      </OrderStorageHelper>
    </CommerceLayer>
  )
}

export const Default: Story = {
  name: "Default — hosted checkout",
  args: {
    label: "Go to checkout",
    className: "text-blue-600 underline hover:text-blue-800",
    target: "_blank",
  },
  render: (args) => (
    <Wrapper>
      <CheckoutLink {...args} />
    </Wrapper>
  ),
}

export const WithOrderCheckoutUrl: Story = {
  name: "Using order checkout_url",
  args: {
    label: "Checkout via order URL",
    hostedCheckout: false,
    className: "text-blue-600 underline hover:text-blue-800",
  },
  render: (args) => (
    <Wrapper>
      <CheckoutLink {...args} />
    </Wrapper>
  ),
}

/**
 * Use the `children` render prop to fully control the rendered element.
 * The `href` and `handleClick` props are provided by the component and
 * wire up the organization-config-aware navigation automatically.
 */
export const ChildrenProps: Story = {
  name: "Children props (render prop)",
  render: () => (
    <Wrapper>
      <CheckoutLink>
        {({ href, handleClick }) => (
          <a
            href={href}
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Proceed to checkout →
          </a>
        )}
      </CheckoutLink>
    </Wrapper>
  ),
}
