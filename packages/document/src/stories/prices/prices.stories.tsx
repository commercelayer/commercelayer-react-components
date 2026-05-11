import { Price, PricesContainer } from "@commercelayer/react-components"
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
      <blockquote>
        <p>
          No provider or wrapper needed. Drop{" "}
          <code>{'<Price skuCode="…" />'}</code> anywhere inside{" "}
          <code>{"<CommerceLayer>"}</code> and batching happens automatically.
        </p>
      </blockquote>
      <ArgTypes of={Price} />
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
      <hr />
      <h2>PricesContainer (deprecated)</h2>
      <blockquote>
        <p>
          ⚠️ <strong>Deprecated:</strong>{" "}
          <code>{"<PricesContainer>"}</code> is deprecated and will be removed
          in a future major release. Use <code>{'<Price skuCode="…" />'}</code>{" "}
          as a standalone component instead — it handles batching automatically.
        </p>
      </blockquote>
      <p>
        <code>{"<PricesContainer>"}</code> fetches prices for one or more SKU
        codes and stores them in a React context for its{" "}
        <code>{"<Price>"}</code> children. Multiple <code>{"<Price>"}</code>{" "}
        children each register their own <code>skuCode</code> — the container
        batches all registrations into a single API request using a 50 ms
        debounce.
      </p>
      <Source
        language="jsx"
        dark
        code={`
// Deprecated — prefer standalone <Price> instead
import { CommerceLayer, PricesContainer, Price } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <PricesContainer skuCode="MY-SKU-CODE">
    <Price />
  </PricesContainer>
</CommerceLayer>
`}
      />
      <Canvas of={SingleSkuStory} />
      <hr />
      <h2>PricesContainer — batched (deprecated)</h2>
      <p>
        Mount multiple <code>{"<Price>"}</code> components inside{" "}
        <code>{"<PricesContainer>"}</code> — each registers its{" "}
        <code>skuCode</code> and the container debounces all registrations into{" "}
        <strong>one API call</strong>.
      </p>
      <blockquote>
        <p>
          This pattern is still supported but deprecated. The same batching now
          happens automatically when you use standalone{" "}
          <code>{"<Price>"}</code> components without any container.
        </p>
      </blockquote>
      <Source
        language="jsx"
        dark
        code={`
// Deprecated — prefer standalone <Price> components instead
<PricesContainer>
  <Price skuCode="SKU-A" />
  <Price skuCode="SKU-B" />
  <Price skuCode="SKU-C" />
</PricesContainer>
`}
      />
      <Canvas of={BatchedPricesStory} />
    </>
  )
}

const meta = {
  title: "Prices/Price",
  component: Price,
  parameters: {
    layout: "centered",
    docs: {
      page: PricesDocsPage,
    },
  },
} satisfies Meta<typeof Price>

export default meta
type Story = StoryObj<typeof meta>

export const SingleSkuStory: Story = {
  name: "PricesContainer — single SKU",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer skuCode="POST6191FFFFFF000000XXXX">
        <Price
          style={{ fontWeight: "bold", fontSize: "1.25rem" }}
          compareClassName="line-through ml-2"
        />
      </PricesContainer>
    </CommerceLayer>
  ),
}

export const BatchedPricesStory: Story = {
  name: "PricesContainer — batched (single API request)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ width: 220, fontSize: "0.85rem", color: "#666" }}>
              POST6191FFFFFF000000XXXX
            </span>
            <Price
              skuCode="POST6191FFFFFF000000XXXX"
              style={{ fontWeight: "bold" }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ width: 220, fontSize: "0.85rem", color: "#666" }}>
              POLOMXXX000000FFFFFFLXXX
            </span>
            <Price
              skuCode="POLOMXXX000000FFFFFFLXXX"
              style={{ fontWeight: "bold" }}
            />
          </div>
        </div>
      </PricesContainer>
    </CommerceLayer>
  ),
}

export const RenderPropStory: Story = {
  name: "Price — children render prop",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer skuCode="POST6191FFFFFF000000XXXX">
        <Price>
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
      </PricesContainer>
    </CommerceLayer>
  ),
}

export const WithFiltersStory: Story = {
  name: "PricesContainer — with filters",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer
        skuCode="POST6191FFFFFF000000XXXX"
        filters={{ currency_code_eq: "EUR" }}
      >
        <Price style={{ fontWeight: "bold" }} />
      </PricesContainer>
    </CommerceLayer>
  ),
}

export const StandalonePrice: Story = {
  name: "Price — standalone (no PricesContainer)",
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
