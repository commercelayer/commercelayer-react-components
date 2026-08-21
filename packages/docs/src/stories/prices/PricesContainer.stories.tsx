import { Price, PricesContainer } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function PricesContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>PricesContainer</h1>
      <span title="Deprecated" type="warning">
        <p>
          <code>{"<PricesContainer>"}</code> is deprecated and will be removed in a future major
          release. Use <code>{'<Price skuCode="…" />'}</code> as a standalone component instead — it
          handles batching automatically. See <strong>Prices/Price</strong> for the recommended
          pattern.
        </p>
      </span>
      <p>
        <code>{"<PricesContainer>"}</code> fetches prices for one or more SKU codes and stores them
        in a React context for its <code>{"<Price>"}</code> children. Multiple{" "}
        <code>{"<Price>"}</code> children each register their own <code>skuCode</code> — the
        container batches all registrations into a single API request using a 50 ms debounce.
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
import { CommerceLayer, PricesContainer, Price } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <PricesContainer skuCode="MY-SKU-CODE">
    <Price />
  </PricesContainer>
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
import { CommerceLayer, Price } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <Price skuCode="MY-SKU-CODE" />
</CommerceLayer>
`}
      />
      <hr />
      <h2>Examples</h2>
      <Canvas of={SingleSkuStory} />
      <Canvas of={BatchedPricesStory} />
      <Canvas of={WithFiltersStory} />
    </>
  )
}

const meta = {
  title: "Components/Prices/PricesContainer",
  component: PricesContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: PricesContainerDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description:
        "SKU code to fetch the prices for. If not provided, the `sku_code` will be retrieved from the nested `<Price>` components.",
    },
    filters: {
      control: "object",
      description: "SDK query filter to fetch the prices when multiple prices are requested.",
    },
    perPage: {
      control: "number",
      description: "Number of prices per page to fetch.",
    },
    loader: {
      control: "text",
      description: "Content displayed while prices are loading.",
    },
    children: {
      control: false,
      description: "Accepts `<Price>` components as children.",
    },
  },
} satisfies Meta<typeof PricesContainer>

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
            <Price skuCode="POST6191FFFFFF000000XXXX" style={{ fontWeight: "bold" }} />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ width: 220, fontSize: "0.85rem", color: "#666" }}>
              POLOMXXX000000FFFFFFLXXX
            </span>
            <Price skuCode="POLOMXXX000000FFFFFFLXXX" style={{ fontWeight: "bold" }} />
          </div>
        </div>
      </PricesContainer>
    </CommerceLayer>
  ),
}

export const WithFiltersStory: Story = {
  name: "PricesContainer — with filters",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <PricesContainer skuCode="POST6191FFFFFF000000XXXX" filters={{ currency_code_eq: "EUR" }}>
        <Price style={{ fontWeight: "bold" }} />
      </PricesContainer>
    </CommerceLayer>
  ),
}
