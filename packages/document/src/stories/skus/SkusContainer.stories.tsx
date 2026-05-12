import {
  SkuField,
  Skus,
  SkusContainer,
} from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkusContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>SkusContainer</h1>
      <blockquote>
        <p>
          ⚠️ <strong>Deprecated.</strong> Use the standalone{" "}
          <code>{'<Sku skuCode="...">'}</code> component instead — it batches
          requests automatically and requires no container. See{" "}
          <strong>Skus/Sku</strong> for the recommended pattern.
          <code>{"<SkusContainer>"}</code> will be removed in the next major
          version.
        </p>
      </blockquote>
      <p>
        <code>{"<SkusContainer>"}</code> fetches an array of SKUs by code and
        stores them in a React context for its <code>{"<Skus>"}</code> children.
        Internally it debounces registrations into a single API call.
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
      <h2>Skus</h2>
      <p>
        <code>{"<Skus>"}</code> is a child of <code>{"<SkusContainer>"}</code>.
        It iterates over every SKU fetched by the container and renders its
        children once per record — no manual looping required.
      </p>
      <blockquote>
        <p>
          Must be a direct child of <code>{"<SkusContainer>"}</code>. Accepts{" "}
          <code>{"<SkuField>"}</code> and{" "}
          <code>{"<AvailabilityContainer>"}</code> as children.
        </p>
      </blockquote>
      <Source
        language="jsx"
        dark
        code={`
<SkusContainer skus={["TSHIRTWS000000FFFFFFLXXX", "TSHIRTWKFFFFFF000000MXXX"]}>
  <Skus>
    {/* rendered once per SKU */}
    <SkuField attribute="name" tagElement="h3" />
  </Skus>
</SkusContainer>
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
  title: "Skus/SkusContainer",
  component: SkusContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: SkusContainerDocsPage,
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
    <CommerceLayer
      accessToken="my-access-token"
      endpoint="https://demo-store.commercelayer.io"
    >
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
    <CommerceLayer
      accessToken="my-access-token"
      endpoint="https://demo-store.commercelayer.io"
    >
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
