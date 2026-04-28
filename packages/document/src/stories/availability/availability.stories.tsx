import {
  Availability,
  AvailabilityContainer,
  AvailabilityTemplate,
  SkuField,
  Skus,
  SkusContainer,
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

export const BasicAvailability: Story = {
  name: "AvailabilityContainer — basic",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const CustomLabels: Story = {
  name: "AvailabilityTemplate — custom labels",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{
            available: "✅ In stock",
            outOfStock: "❌ Sold out",
            negativeStock: "⚠️ Not available",
          }}
        />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithDeliveryLeadTimeDays: Story = {
  name: "AvailabilityTemplate — lead time in days",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{ available: "Available" }}
          timeFormat="days"
        />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithDeliveryLeadTimeHours: Story = {
  name: "AvailabilityTemplate — lead time in hours",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          labels={{ available: "Available" }}
          timeFormat="hours"
        />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithShippingMethodName: Story = {
  name: "AvailabilityTemplate — with shipping method name",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate timeFormat="days" showShippingMethodName />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithShippingMethodPrice: Story = {
  name: "AvailabilityTemplate — with shipping method price",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate
          timeFormat="days"
          showShippingMethodName
          showShippingMethodPrice
        />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithGetQuantityCallback: Story = {
  name: "AvailabilityContainer — getQuantity callback",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer
        skuCode="POLOMXXX000000FFFFFFLXXX"
        getQuantity={(quantity) => {
          console.log("quantity updated:", quantity)
        }}
      >
        <AvailabilityTemplate />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const WithChildrenRenderProp: Story = {
  name: "AvailabilityTemplate — children render prop",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
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
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}

export const InsideSkusContainer: Story = {
  name: "AvailabilityContainer — inside SkusContainer",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkusContainer
        skus={["POLOMXXX000000FFFFFFLXXX", "TSHIRTMM000000FFFFFFXLXX"]}
      >
        <Skus>
          <div style={{ marginBottom: 16 }}>
            <SkuField
              attribute="name"
              tagElement="h3"
              style={{ marginBottom: 4 }}
            />
            <AvailabilityContainer>
              <AvailabilityTemplate />
            </AvailabilityContainer>
          </div>
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  ),
}
