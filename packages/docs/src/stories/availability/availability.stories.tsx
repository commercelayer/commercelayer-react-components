import { Availability, AvailabilityTemplate, Sku, SkuField } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function AvailabilityDocsPage(): JSX.Element {
  return (
    <>
      <h1>Availability</h1>
      <p>
        The Availability components let you display real-time stock quantity and delivery lead times
        for any SKU. They are powered by the Commerce Layer inventory model and work by fetching
        availability data through the <code>useAvailability</code> hook from{" "}
        <code>@commercelayer/react-hooks-components</code>. All Availability components must be nested inside the{" "}
        <code>{"<CommerceLayer>"}</code> context.
      </p>
      <hr />
      <h2>Availability (standalone)</h2>
      <p>
        The preferred way to display availability. <code>{"<Availability>"}</code> fetches inventory
        data on its own — no container wrapper needed. Picks up <code>skuCode</code> from a parent{" "}
        <code>{"<Sku>"}</code> or line-item context when no prop is given.
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
  <Availability skuCode="TSHIRTMM000000FFFFFFXLXX">
    <AvailabilityTemplate labels={{ available: 'In stock', outOfStock: 'Out of stock' }} />
  </Availability>
</CommerceLayer>
`}
      />
      <Canvas of={StandaloneAvailability} />
      <hr />
      <h2>Usage inside Skus</h2>
      <p>
        When used inside a <code>{"<Sku>"}</code> or <code>{"<SkusContainer>"}</code> →{" "}
        <code>{"<Skus>"}</code> tree, <code>{"<Availability>"}</code> automatically inherits the{" "}
        <code>skuCode</code> from the current SKU context — no need to pass <code>skuCode</code>{" "}
        explicitly.
      </p>
      <Canvas of={InsideSku} />
    </>
  )
}

const meta = {
  title: "Components/Availability/Availability",
  component: Availability,
  parameters: {
    layout: "centered",
    docs: {
      page: AvailabilityDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description:
        "The SKU code to fetch availability for. Automatically inherited from a parent `<Sku>` or line-item context when omitted.",
    },
    skuId: {
      control: "text",
      description:
        "The SKU resource ID. Takes precedence over `skuCode` and improves performance by skipping the code-to-id lookup.",
    },
    getQuantity: {
      control: false,
      description:
        "Callback fired whenever the available quantity changes. Receives the quantity as a number.",
    },
    loader: {
      control: "text",
      description: "Content displayed while availability data is loading.",
    },
    children: {
      control: false,
      description:
        "Accepts `<AvailabilityTemplate>` as a child to display stock status and lead time.",
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
        <AvailabilityTemplate labels={{ available: "In stock", outOfStock: "Out of stock" }} />
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

export const InsideSku: Story = {
  name: "Availability — inside Sku (inherits skuCode)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Sku skuCode="POLOMXXX000000FFFFFFLXXX">
        <SkuField attribute="name" tagElement="h3" style={{ marginBottom: 4 }} />
        <Availability>
          <AvailabilityTemplate />
        </Availability>
      </Sku>
    </CommerceLayer>
  ),
}
