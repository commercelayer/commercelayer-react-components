import { Price, PricesContainer } from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Prices/Stories",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

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
