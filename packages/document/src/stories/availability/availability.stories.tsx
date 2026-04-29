import {
  Availability,
  AvailabilityContainer,
  AvailabilityTemplate,
  Sku,
  SkuField,
} from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Availability/Stories",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const StandaloneAvailability: Story = {
  name: "Availability — standalone (no container)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{ available: "In stock", outOfStock: "Out of stock" }}
        />
      </Availability>
    </CommerceLayer>
  ),
}

export const CustomLabels: Story = {
  name: "AvailabilityTemplate — custom labels",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{
            available: "✅ In stock",
            outOfStock: "❌ Sold out",
            negativeStock: "⚠️ Not available",
          }}
        />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithDeliveryLeadTimeDays: Story = {
  name: "AvailabilityTemplate — lead time in days",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{ available: "Available" }}
          timeFormat="days"
        />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithDeliveryLeadTimeHours: Story = {
  name: "AvailabilityTemplate — lead time in hours",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{ available: "Available" }}
          timeFormat="hours"
        />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithShippingMethodName: Story = {
  name: "AvailabilityTemplate — with shipping method name",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate timeFormat="days" showShippingMethodName />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithShippingMethodPrice: Story = {
  name: "AvailabilityTemplate — with shipping method price",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          timeFormat="days"
          showShippingMethodName
          showShippingMethodPrice
        />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithGetQuantityCallback: Story = {
  name: "Availability — getQuantity callback",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability
        skuCode="POLOMXXX000000FFFFFFLXXX"
        getQuantity={(quantity) => {
          console.log("quantity updated:", quantity)
        }}
      >
        <AvailabilityTemplate />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithChildrenRenderProp: Story = {
  name: "AvailabilityTemplate — children render prop",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate>
          {({ quantity, text, min, max }) => (
            <div style={{ fontFamily: "monospace", fontSize: 14 }}>
              <strong>{text}</strong>
              {quantity > 0 && min != null && (
                <p style={{ marginTop: 4, color: "#666" }}>
                  Ships in {min.days}–{max?.days ?? min.days} day(s)
                </p>
              )}
            </div>
          )}
        </AvailabilityTemplate>
      </Availability>
    </CommerceLayer>
  ),
}

export const InsideSku: Story = {
  name: "Availability — inside Sku (inherits skuCode)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Sku skuCode="POLOMXXX000000FFFFFFLXXX">
        <SkuField
          attribute="name"
          tagElement="h3"
          style={{ marginBottom: 4 }}
        />
        <Availability>
          <AvailabilityTemplate />
        </Availability>
      </Sku>
    </CommerceLayer>
  ),
}

export const DeprecatedContainer: Story = {
  name: "AvailabilityContainer — deprecated (legacy)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}
