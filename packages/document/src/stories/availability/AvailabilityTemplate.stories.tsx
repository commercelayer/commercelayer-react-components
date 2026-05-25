import { Availability, AvailabilityTemplate } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function AvailabilityTemplateDocsPage(): JSX.Element {
  return (
    <>
      <h1>AvailabilityTemplate</h1>
      <p>
        Reads from the parent <code>{"<Availability>"}</code> context and renders a{" "}
        <code>{"<span>"}</code> with availability text. Customise the label shown for each state (
        <code>available</code>, <code>outOfStock</code>, <code>negativeStock</code>) and optionally
        include delivery lead time and shipping method details.
      </p>
      <blockquote>
        <p>
          Must be a descendant of the <code>{"<Availability>"}</code> component.
        </p>
      </blockquote>
      <ArgTypes />
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>labels.available</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>"Available"</code>
            </td>
            <td>Text shown when quantity &gt; 0</td>
          </tr>
          <tr>
            <td>
              <code>labels.outOfStock</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>"Out of stock"</code>
            </td>
            <td>Text shown when quantity is 0</td>
          </tr>
          <tr>
            <td>
              <code>labels.negativeStock</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>"Not available"</code>
            </td>
            <td>Text shown when quantity is negative</td>
          </tr>
          <tr>
            <td>
              <code>timeFormat</code>
            </td>
            <td>
              <code>"days" | "hours"</code>
            </td>
            <td>—</td>
            <td>When set, delivery lead time is appended to the label</td>
          </tr>
          <tr>
            <td>
              <code>showShippingMethodName</code>
            </td>
            <td>
              <code>boolean</code>
            </td>
            <td>
              <code>false</code>
            </td>
            <td>
              Requires <code>timeFormat</code>. Appends the shipping method name
            </td>
          </tr>
          <tr>
            <td>
              <code>showShippingMethodPrice</code>
            </td>
            <td>
              <code>boolean</code>
            </td>
            <td>
              <code>false</code>
            </td>
            <td>
              Requires <code>timeFormat</code>. Appends the formatted shipping price
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <h2>Custom labels</h2>
      <p>
        Customise the displayed text for all stock states via the <code>labels</code> prop.
      </p>
      <Canvas of={CustomLabels} />
      <h2>Lead time</h2>
      <p>
        Set <code>timeFormat</code> to <code>"days"</code> or <code>"hours"</code> to show the
        shipping lead time alongside the availability status.
      </p>
      <Canvas of={WithDeliveryLeadTimeDays} />
      <Canvas of={WithDeliveryLeadTimeHours} />
      <h2>Shipping method</h2>
      <Canvas of={WithShippingMethodName} />
      <Canvas of={WithShippingMethodPrice} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to fully control the rendered output. The function
        receives the full availability context including <code>quantity</code>, <code>text</code>,{" "}
        <code>min</code>, <code>max</code>, and <code>shipping_method</code>.
      </p>
      <Source
        language="jsx"
        dark
        code={`
<Availability skuCode="TSHIRTMM000000FFFFFFXLXX">
  <AvailabilityTemplate>
    {({ quantity, text, min, max }) => (
      <div>
        <strong>{text}</strong>
        {quantity > 0 && min != null && (
          <p>Ships in {min.days}–{max?.days ?? min.days} days</p>
        )}
      </div>
    )}
  </AvailabilityTemplate>
</Availability>
`}
      />
      <Canvas of={WithChildrenRenderProp} />
    </>
  )
}

const meta = {
  title: "Components/Availability/AvailabilityTemplate",
  component: AvailabilityTemplate,
  parameters: {
    layout: "centered",
    docs: {
      page: AvailabilityTemplateDocsPage,
    },
  },
  argTypes: {
    labels: {
      control: "object",
      description: "Text labels for each stock state: `available`, `outOfStock`, `negativeStock`.",
    },
    timeFormat: {
      control: "select",
      options: ["days", "hours"],
      description: "When set, delivery lead time is appended to the availability label.",
    },
    showShippingMethodName: {
      control: "boolean",
      description: "Requires `timeFormat`. Appends the shipping method name to the label.",
    },
    showShippingMethodPrice: {
      control: "boolean",
      description: "Requires `timeFormat`. Appends the formatted shipping price to the label.",
    },
    children: {
      control: false,
      description:
        "Render prop receiving `{ quantity, text, min, max, shipping_method }` for a fully custom availability UI.",
    },
  },
} satisfies Meta<typeof AvailabilityTemplate>

export default meta
type Story = StoryObj<typeof meta>

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
        <AvailabilityTemplate labels={{ available: "Available" }} timeFormat="days" />
      </Availability>
    </CommerceLayer>
  ),
}

export const WithDeliveryLeadTimeHours: Story = {
  name: "AvailabilityTemplate — lead time in hours",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Availability skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate labels={{ available: "Available" }} timeFormat="hours" />
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
        <AvailabilityTemplate timeFormat="days" showShippingMethodName showShippingMethodPrice />
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
