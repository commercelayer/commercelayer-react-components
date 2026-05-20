import { Price } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function PricesDocsPage(): JSX.Element {
  return (
    <>
      <h1>Prices</h1>
      <p>
        The Prices components let you fetch and display product prices from the
        Commerce Layer API. All price components must be nested inside the{" "}
        <code>{"<CommerceLayer>"}</code> context that handles API
        authentication.
      </p>
      <p>
        Refer to the{" "}
        <a href="https://docs.commercelayer.io/core/v/api-reference/prices/object">
          Prices API reference
        </a>{" "}
        for the full list of available attributes.
      </p>
      <hr />
      <h2>Price (standalone — recommended)</h2>
      <p>
        <code>{"<Price>"}</code> can be used{" "}
        <strong>
          directly under <code>{"<CommerceLayer>"}</code>
        </strong>{" "}
        without any container. It automatically registers its{" "}
        <code>skuCode</code> in a module-level batch store and a 50 ms debounce
        collects all sibling registrations into{" "}
        <strong>one SWR-deduplicated API request</strong>.
      </p>
      <span title="Note" type="info">
        <p>
          No provider or wrapper needed. Drop{" "}
          <code>{'<Price skuCode="…" />'}</code> anywhere inside{" "}
          <code>{"<CommerceLayer>"}</code> and batching happens automatically.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, Price } from '@commercelayer/react-components'

// All three <Price> components are batched into a single API request automatically.
<CommerceLayer accessToken="...">
  <Price skuCode="SKU-A" className="font-bold" />
  <Price skuCode="SKU-B" className="font-bold" />
  <Price skuCode="SKU-C" className="font-bold" loader={<span>…</span>} />
</CommerceLayer>
`}
      />
      <Canvas of={StandalonePrice} />
      <hr />
      <h2>Render prop</h2>
      <p>
        Use the <code>children</code> render prop to access the raw{" "}
        <code>prices</code> array and <code>loading</code> state for a fully
        custom price UI. Works in both standalone and container modes.
      </p>
      <Source
        language="jsx"
        dark
        code={`
<CommerceLayer accessToken="...">
  <Price skuCode="MY-SKU-CODE">
    {({ prices, loading }) => {
      if (loading) return <span>Loading…</span>
      if (prices.length === 0) return <span>No price available</span>
      const [p] = prices
      return (
        <div>
          <strong>{p.formatted_amount}</strong>
          {p.formatted_compare_at_amount != null && (
            <s className="ml-2 text-gray-400">{p.formatted_compare_at_amount}</s>
          )}
        </div>
      )
    }}
  </Price>
</CommerceLayer>
`}
      />
      <Canvas of={RenderPropStory} />
    </>
  )
}

const meta = {
  title: "Components/Prices/Price",
  component: Price,
  parameters: {
    layout: "centered",
    docs: {
      page: PricesDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description:
        "The SKU code whose price to fetch. When used standalone (no `PricesContainer` parent), this triggers an automatic batched API request.",
    },
    showCompare: {
      control: "boolean",
      description:
        "When `false`, the `compare_at` (strike-through) price is not displayed.",
    },
    compareClassName: {
      control: "text",
      description: "CSS class name applied to the compare-at price element.",
    },
    loader: {
      control: "text",
      description:
        "Content displayed while the price is loading in standalone mode.",
    },
    children: {
      control: false,
      description:
        "Render prop receiving `{ prices, loading, loader }` for a fully custom price UI.",
    },
  },
} satisfies Meta<typeof Price>

export default meta
type Story = StoryObj<typeof meta>

export const RenderPropStory: Story = {
  name: "Price — children render prop",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Price skuCode="POST6191FFFFFF000000XXXX">
        {({ prices, loading }) => {
          if (loading) return <span style={{ color: "#999" }}>Loading…</span>
          if (prices.length === 0)
            return <span style={{ color: "red" }}>No price available</span>
          const [p] = prices
          return (
            <div>
              <strong style={{ fontSize: "1.25rem" }}>
                {p.formatted_amount}
              </strong>
              {p.formatted_compare_at_amount != null && (
                <s style={{ marginLeft: 8, color: "#999" }}>
                  {p.formatted_compare_at_amount}
                </s>
              )}
            </div>
          )
        }}
      </Price>
    </CommerceLayer>
  ),
}

export const StandalonePrice: Story = {
  name: "Price — standalone",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ width: 240, fontSize: "0.85rem", color: "#666" }}>
            POST6191FFFFFF000000XXXX
          </span>
          <Price
            skuCode="POST6191FFFFFF000000XXXX"
            style={{ fontWeight: "bold" }}
            loader={
              <span style={{ color: "#bbb", fontSize: "0.8rem" }}>…</span>
            }
          />
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ width: 240, fontSize: "0.85rem", color: "#666" }}>
            POLOMXXX000000FFFFFFLXXX
          </span>
          <Price
            skuCode="POLOMXXX000000FFFFFFLXXX"
            style={{ fontWeight: "bold" }}
            loader={
              <span style={{ color: "#bbb", fontSize: "0.8rem" }}>…</span>
            }
          />
        </div>
      </div>
    </CommerceLayer>
  ),
}
