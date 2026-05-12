import {
  Availability,
  AvailabilityContainer,
  AvailabilityTemplate,
  Sku,
  SkuField,
} from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function AvailabilityDocsPage(): JSX.Element {
  return (
    <>
      <h1>Availability</h1>
      <p>
        The Availability components display real-time stock and shipping
        information for a SKU. Use the standalone{" "}
        <code>{"<Availability>"}</code> component (recommended) — it fetches
        availability data automatically. The legacy{" "}
        <code>{"<AvailabilityContainer>"}</code> is kept for backwards
        compatibility.
      </p>
      <hr />
      <h2>Availability</h2>
      <p>
        Standalone component that fetches availability without any container.
        Picks up <code>skuCode</code> from a parent <code>{"<Sku>"}</code> or
        line-item context when no prop is given.
      </p>
      <blockquote>
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Accepts{" "}
          <code>{"<AvailabilityTemplate>"}</code> as children.
        </p>
      </blockquote>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, Availability, AvailabilityTemplate } from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
    <AvailabilityTemplate
      labels={{ available: "In stock", outOfStock: "Out of stock" }}
    />
  </Availability>
</CommerceLayer>
`}
      />
      <Canvas of={StandaloneAvailability} />
      <hr />
      <h2>AvailabilityTemplate — custom labels</h2>
      <p>
        Customise the displayed text for all stock states via the{" "}
        <code>labels</code> prop.
      </p>
      <Canvas of={CustomLabels} />
      <hr />
      <h2>Lead time</h2>
      <p>
        Set <code>timeFormat</code> to <code>"days"</code> or{" "}
        <code>"hours"</code> to show the shipping lead time alongside the
        availability status.
      </p>
      <Canvas of={WithDeliveryLeadTimeDays} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to{" "}
        <code>{"<AvailabilityTemplate>"}</code> to receive the raw data (
        <code>quantity</code>, <code>text</code>, <code>min</code>,{" "}
        <code>max</code>) and build a custom UI.
      </p>
      <Canvas of={WithChildrenRenderProp} />
      <hr />
      <h2>Inside Sku (inherits skuCode)</h2>
      <p>
        When <code>{"<Availability>"}</code> is nested inside{" "}
        <code>{"<Sku>"}</code>, the <code>skuCode</code> prop can be omitted —
        it is inherited from the context automatically.
      </p>
      <Canvas of={InsideSku} />
      <hr />
      <h2>AvailabilityContainer (deprecated)</h2>
      <p>
        <code>{"<AvailabilityContainer>"}</code> is the legacy wrapper. Prefer{" "}
        the standalone <code>{"<Availability>"}</code> component for new code.
      </p>
      <Canvas of={DeprecatedContainer} />
    </>
  )
}

const meta = {
  title: "Availability/Availability",
  component: Availability,
  parameters: {
    layout: "centered",
    docs: {
      page: AvailabilityDocsPage,
    },
  },
} satisfies Meta<typeof Availability>

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
