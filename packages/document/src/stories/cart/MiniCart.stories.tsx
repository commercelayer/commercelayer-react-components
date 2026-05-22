import { HostedCart, Order } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"
import {
  AddSampleItems,
  OrderStorage as OrderStorageHelper,
} from "../_internals/OrderStorage"

function MiniCartDocsPage(): JSX.Element {
  return (
    <>
      <h1>MiniCart</h1>
      <p>
        The mini cart is <code>{"<HostedCart type=\"mini\">"}</code> — a fixed
        slide-in panel that overlays the page from the right side. It loads the
        same Commerce Layer hosted cart micro-frontend as the inline variant, but
        in a drawer controlled by the <code>open</code> prop.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<Order>"}</code> (wrapped in{" "}
          <code>{"<OrderStorage>"}</code>). Pair it with a{" "}
          <code>{"<CartLink type=\"mini\" />"}</code> or your own trigger button
          to manage the <code>open</code> state.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import { useState } from 'react'
import {
  CommerceLayer,
  OrderStorage,
  Order,
  CartLink,
  HostedCart,
} from '@commercelayer/react-components'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <CommerceLayer accessToken="...">
      <OrderStorage persistKey="my-cart">
        <Order>
          <CartLink type="mini" label="Open cart" />
          <HostedCart
            type="mini"
            open={isOpen}
            handleOpen={() => setIsOpen(o => !o)}
          />
        </Order>
      </OrderStorage>
    </CommerceLayer>
  )
}
`}
      />
      <hr />
      <h2>Mini cart</h2>
      <p>
        Toggle the <code>open</code> control in the Controls panel to preview
        the open and closed states. In a real app bind <code>open</code> and{" "}
        <code>handleOpen</code> to local state.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Auto-open on add to cart</h2>
      <p>
        Set <code>openAdd</code> to <code>true</code> so the panel opens
        automatically whenever an item is added via{" "}
        <code>{"<AddToCartButton>"}</code>. Click the button below to trigger
        the flow.
      </p>
      <Canvas of={OpenOnAdd} />
    </>
  )
}

const meta = {
  title: "Components/Cart/MiniCart",
  component: HostedCart,
  parameters: {
    docs: {
      page: MiniCartDocsPage,
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the mini cart panel is open.",
    },
    openAdd: {
      control: "boolean",
      description:
        'Automatically opens the panel when an item is added via `<AddToCartButton>`.',
    },
    handleOpen: {
      control: false,
      description:
        "Callback fired when the background overlay or close icon is clicked. Use this to toggle `open` from outside.",
    },
    customDomain: {
      control: "text",
      description:
        "Domain of a forked cart application. Overrides the default `<slug>.commercelayer.app` hostname.",
    },
    style: {
      control: "object",
      description:
        "Style overrides for the panel parts: `cart`, `container`, `background`, `icon`, `iconContainer` — each a `CSSProperties` object.",
    },
  },
} satisfies Meta<typeof HostedCart>

export default meta
type Story = StoryObj<typeof meta>

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorageHelper persistKey="cl-examples-miniCart">
        <Order>{children}</Order>
      </OrderStorageHelper>
    </CommerceLayer>
  )
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
export const Default: Story = {
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
export const OpenOnAdd: Story = {
  name: "Auto-open on add to cart",
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
