import { SkuField, Skus, SkusContainer } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkusContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>SkusContainer</h1>
      <span title="Deprecated" type="warning">
        <p>
          Use the standalone <code>{'<Sku skuCode="...">'}</code> component instead — it batches
          requests automatically and requires no container. See <strong>Skus/Sku</strong> for the
          recommended pattern. <code>{"<SkusContainer>"}</code> will be removed in the next major
          version.
        </p>
      </span>
      <p>
        <code>{"<SkusContainer>"}</code> fetches an array of SKUs by code and stores them in a React
        context for its <code>{"<Skus>"}</code> children. Internally it debounces registrations into
        a single API call.
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
import { CommerceLayer, SkusContainer, Skus, SkuField } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <SkusContainer skus={["TSHIRTWS000000FFFFFFLXXX", "TSHIRTWKFFFFFF000000MXXX"]}>
    <Skus>
      <SkuField attribute="name" tagElement="h2" />
      <SkuField attribute="description" tagElement="p" />
    </Skus>
  </SkusContainer>
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
import { CommerceLayer, Sku, SkuField } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
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
      <hr />
      <h2>Examples</h2>
      <Canvas of={Default} />
      <Canvas of={WithQueryParams} />
    </>
  )
}

const meta = {
  title: "Components/Skus/SkusContainer",
  component: SkusContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: SkusContainerDocsPage,
    },
  },
  argTypes: {
    skus: {
      control: "object",
      description: "Array of SKU codes to fetch. All codes are batched into a single API request.",
    },
    queryParams: {
      control: "object",
      description:
        "Optional query parameters forwarded to the SKUs API request (pagination, sorting, field selection, filters).",
    },
    children: {
      control: false,
      description: "Accepts `<Skus>` as a child to iterate over fetched SKUs.",
    },
  },
} satisfies Meta<typeof SkusContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "SkusContainer — name and code",
  args: {
    skus: ["POLOMXXX000000FFFFFFLXXX", "CROPTOPWFFFFFF000000XSXX"],
  },
  render: (args) => (
    <CommerceLayer accessToken="my-access-token" endpoint="https://demo-store.commercelayer.io">
      <SkusContainer {...args}>
        <Skus>
          <div style={{ marginBottom: 12 }}>
            <SkuField attribute="name" tagElement="h3" />
            <SkuField attribute="code" tagElement="p" />
          </div>
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  ),
}

export const WithQueryParams: Story = {
  name: "SkusContainer — with query params",
  args: {
    skus: ["POLOMXXX000000FFFFFFLXXX", "CROPTOPWFFFFFF000000XSXX"],
    queryParams: {
      pageSize: 25,
      pageNumber: 1,
      fields: ["name", "description", "image_url", "reference"],
      sort: { name: "asc" },
    },
  },
  render: (args) => (
    <CommerceLayer accessToken="my-access-token" endpoint="https://demo-store.commercelayer.io">
      <SkusContainer {...args}>
        <Skus>
          <div style={{ marginBottom: 12 }}>
            <SkuField attribute="name" tagElement="h3" />
            <SkuField attribute="code" tagElement="p" />
          </div>
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  ),
}
