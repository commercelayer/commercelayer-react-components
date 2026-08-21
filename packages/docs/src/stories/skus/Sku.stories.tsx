import { Sku, SkuField } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkusDocsPage(): JSX.Element {
  return (
    <>
      <h1>SKUs</h1>
      <p>
        The SKU components let you fetch and display product data from the Commerce Layer API. All
        SKU components must be nested inside the <code>{"<CommerceLayer>"}</code> context that
        handles API authentication.
      </p>
      <p>
        Refer to the{" "}
        <a href="https://docs.commercelayer.io/core/v/api-reference/skus/object">
          SKUs API reference
        </a>{" "}
        for the full list of available attributes.
      </p>
      <hr />
      <h2>Sku (standalone — recommended)</h2>
      <p>
        <code>{"<Sku>"}</code> is a standalone component that fetches and displays SKU data without
        requiring a <code>{"<SkusContainer>"}</code> parent. Multiple sibling <code>{"<Sku>"}</code>{" "}
        components are automatically batched into a single API request via a module-level debounce
        store, so rendering many SKUs on one page is efficient.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Accepts <code>{"<SkuField>"}</code>{" "}
          and <code>{"<AvailabilityContainer>"}</code> as children.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, Sku, SkuField } from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
    <SkuField attribute="name" tagElement="h2" />
    <SkuField attribute="description" tagElement="p" />
  </Sku>
  <Sku skuCode="TSHIRTWKFFFFFF000000MXXX">
    <SkuField attribute="name" tagElement="h2" />
    <SkuField attribute="description" tagElement="p" />
  </Sku>
</CommerceLayer>
`}
      />
      <Canvas of={StandaloneSkuStory} />
    </>
  )
}

const meta = {
  title: "Components/Skus/Sku",
  component: Sku,
  parameters: {
    layout: "centered",
    docs: {
      page: SkusDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description:
        "The SKU code to fetch. Multiple sibling `<Sku>` components with different codes are batched into a single API request.",
    },
    loader: {
      control: "text",
      description: "Content displayed while the SKU data is loading.",
    },
    children: {
      control: false,
      description: "Accepts `<SkuField>` and `<AvailabilityContainer>` as children.",
    },
  },
} satisfies Meta<typeof Sku>

export default meta
type Story = StoryObj<typeof meta>

export const StandaloneSkuStory: Story = {
  name: "Sku — standalone (no container)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
        <div style={{ marginBottom: 12 }}>
          <SkuField attribute="name" tagElement="h3" />
          <SkuField attribute="code" tagElement="p" />
        </div>
      </Sku>
      <Sku skuCode="TSHIRTWKFFFFFF000000MXXX">
        <div style={{ marginBottom: 12 }}>
          <SkuField attribute="name" tagElement="h3" />
          <SkuField attribute="code" tagElement="p" />
        </div>
      </Sku>
    </CommerceLayer>
  ),
}
