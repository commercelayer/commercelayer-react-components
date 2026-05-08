import {
  AddToCartButton,
  Order,
  Sku,
  SkuField,
} from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Orders/AddToCartButton",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BasicStory: Story = {
  name: "AddToCartButton — basic",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <AddToCartButton skuCode="TSHIRTWS000000FFFFFFLXXX" />
      </Order>
    </CommerceLayer>
  ),
}

export const CustomLabelStory: Story = {
  name: "AddToCartButton — custom label",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <AddToCartButton skuCode="TSHIRTWS000000FFFFFFLXXX" label="Buy now" />
      </Order>
    </CommerceLayer>
  ),
}

export const CustomQuantityStory: Story = {
  name: "AddToCartButton — custom quantity",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <AddToCartButton
          skuCode="TSHIRTWS000000FFFFFFLXXX"
          quantity="3"
          label="Add 3 to cart"
        />
      </Order>
    </CommerceLayer>
  ),
}

export const BuyNowStory: Story = {
  name: "AddToCartButton — buy now mode",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <AddToCartButton
          skuCode="TSHIRTWS000000FFFFFFLXXX"
          label="Buy now"
          buyNowMode
          checkoutUrl="https://checkout.your-domain.com"
        />
      </Order>
    </CommerceLayer>
  ),
}

export const SkuContextStory: Story = {
  name: "AddToCartButton — skuCode from Sku context",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
          <div style={{ display: "grid", gap: 8 }}>
            <SkuField attribute="name" tagElement="h3" />
            <AddToCartButton />
          </div>
        </Sku>
      </Order>
    </CommerceLayer>
  ),
}

export const RenderPropStory: Story = {
  name: "AddToCartButton — custom children (render prop)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Order>
        <AddToCartButton skuCode="TSHIRTWS000000FFFFFFLXXX">
          {({ handleClick, disabled, label }) => (
            <button
              onClick={() => void handleClick()}
              disabled={disabled}
              style={{
                padding: "8px 20px",
                background: disabled ? "#ccc" : "#000",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {disabled ? "Adding…" : label}
            </button>
          )}
        </AddToCartButton>
      </Order>
    </CommerceLayer>
  ),
}
