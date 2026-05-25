import { AddToCartButton, CartLink, HostedCart, Order } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type JSX } from "react"
import CommerceLayer from "../_internals/CommerceLayer"
import { OrderStorage as OrderStorageHelper } from "../_internals/OrderStorage"

function MiniCartDocsPage(): JSX.Element {
  return (
    <>
      <h1>MiniCart</h1>
      <p>
        The mini cart is <code>{'<HostedCart type="mini">'}</code> — a fixed slide-in panel that
        overlays the page from the right side. It loads the same Commerce Layer hosted cart
        micro-frontend as the inline variant, but in a drawer controlled by the <code>open</code>{" "}
        prop.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<Order>"}</code> (wrapped in <code>{"<OrderStorage>"}</code>).
          Pair it with a <code>{'<CartLink type="mini" />'}</code> or your own trigger button to
          manage the <code>open</code> state.
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
        Click the button to open the slide-in panel. The <code>handleOpen</code> callback keeps
        external state in sync when the overlay or close icon is clicked inside the cart.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Auto-open on add to cart</h2>
      <p>
        Set <code>openAdd</code> to <code>true</code> so the panel opens automatically after{" "}
        <code>{"<AddToCartButton>"}</code> successfully adds an item to the order. Click{" "}
        <strong>Add to cart</strong> below to trigger the flow.
      </p>
      <Canvas of={OpenOnAdd} />
    </>
  )
}

const meta = {
  title: "Components/Cart/MiniCart",
  component: HostedCart,
  decorators: [
    (Story) => (
      <div style={{ minHeight: "500px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      page: MiniCartDocsPage,
    },
  },
  argTypes: {
    open: {
      control: false,
      description: "Controls whether the mini cart panel is open.",
    },
    openAdd: {
      control: "boolean",
      description: "Automatically opens the panel when an item is added via `<AddToCartButton>`.",
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
 * Controlled mini cart: `open` and `handleOpen` are wired to local state so the
 * panel can be opened with the button and closed by clicking the overlay or the
 * close icon inside the cart iframe.
 */
export const Default: Story = {
  name: "Mini cart",
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <Wrapper>
        <CartLink
          type="mini"
          label="Open mini cart"
          className="px-4 py-2 bg-black text-white rounded text-sm"
        />
        <HostedCart type="mini" open={isOpen} handleOpen={() => setIsOpen((o) => !o)} />
      </Wrapper>
    )
  },
}

/**
 * When `openAdd` is `true` the panel opens automatically after
 * `<AddToCartButton>` successfully adds an item. The `"open-cart"` event is
 * published internally by `AddToCartButton` on success.
 */
export const OpenOnAdd: Story = {
  name: "Auto-open on add to cart",
  args: {
    type: "mini",
    openAdd: true,
  },
  render: (args) => (
    <Wrapper>
      <AddToCartButton
        skuCode="SWEATWCX000000FFFFFFXSXX"
        label="Add to cart"
        quantity="1"
        className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-50"
      />
      <HostedCart {...args} />
    </Wrapper>
  ),
}
