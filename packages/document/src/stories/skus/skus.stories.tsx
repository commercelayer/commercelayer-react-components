import {
  Sku,
  SkuField,
  SkuList,
  SkuListsContainer,
  Skus,
  SkusContainer,
} from "@commercelayer/react-components"
import { ArgTypes, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkusDocsPage(): JSX.Element {
  return (
    <>
      <h1>SKUs</h1>
      <p>
        The SKU components let you fetch and display product data from the
        Commerce Layer API. All SKU components must be nested inside the{" "}
        <code>{"<CommerceLayer>"}</code> context that handles API
        authentication.
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
        <code>{"<Sku>"}</code> is a standalone component that fetches and
        displays SKU data without requiring a <code>{"<SkusContainer>"}</code>{" "}
        parent. Multiple sibling <code>{"<Sku>"}</code> components are
        automatically batched into a single API request via a module-level
        debounce store, so rendering many SKUs on one page is efficient.
      </p>
      <blockquote>
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Accepts{" "}
          <code>{"<SkuField>"}</code> and{" "}
          <code>{"<AvailabilityContainer>"}</code> as children.
        </p>
      </blockquote>
      <ArgTypes of={Sku} />
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
      <hr />
      <h2>SkusContainer (deprecated)</h2>
      <blockquote>
        <p>
          ⚠️ <strong>Deprecated:</strong>{" "}
          <code>{"<SkusContainer>"}</code> is deprecated. Use the standalone{" "}
          <code>{'<Sku skuCode="...">'}</code> component instead (see above).
        </p>
      </blockquote>
      <p>
        <strong>Before (deprecated):</strong>
      </p>
      <Source
        language="jsx"
        dark
        code={`
<SkusContainer skus={["TSHIRTWS000000FFFFFFLXXX", "TSHIRTWKFFFFFF000000MXXX"]}>
  <Skus>
    <SkuField attribute="name" tagElement="h2" />
    <SkuField attribute="description" tagElement="p" />
  </Skus>
</SkusContainer>
`}
      />
      <p>
        <strong>After:</strong>
      </p>
      <Source
        language="jsx"
        dark
        code={`
<Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
  <SkuField attribute="name" tagElement="h2" />
  <SkuField attribute="description" tagElement="p" />
</Sku>
<Sku skuCode="TSHIRTWKFFFFFF000000MXXX">
  <SkuField attribute="name" tagElement="h2" />
  <SkuField attribute="description" tagElement="p" />
</Sku>
`}
      />
      <hr />
      <h2>Skus</h2>
      <p>
        <code>{"<Skus>"}</code> loops through all SKU records stored in the
        parent <code>{"<SkusContainer>"}</code> context and renders its children
        once for each SKU. You do not need to loop manually — the component
        handles iteration.
      </p>
      <blockquote>
        <p>
          Must be a child of <code>{"<SkusContainer>"}</code>. Accepts{" "}
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
  </Skus>
</SkusContainer>
`}
      />
      <hr />
      <h2>SkuField</h2>
      <p>
        <code>{"<SkuField>"}</code> renders any attribute of the current SKU
        from the parent <code>{"<SkusContainer>"}</code> or{" "}
        <code>{"<Sku>"}</code> context. Use the <code>attribute</code> prop to
        select which field to display and <code>tagElement</code> to control the
        HTML tag (defaults to <code>span</code>). When{" "}
        <code>{'tagElement="img"'}</code>, additional{" "}
        <code>{"<img>"}</code> props such as <code>width</code> and{" "}
        <code>height</code> are accepted.
      </p>
      <blockquote>
        <p>
          Must be a descendant of <code>{"<SkusContainer>"}</code> or{" "}
          <code>{"<Sku>"}</code>. See the{" "}
          <a href="https://docs.commercelayer.io/core/v/api-reference/skus/object">
            SKUs API object
          </a>{" "}
          for all available attributes (e.g. <code>name</code>,{" "}
          <code>description</code>, <code>image_url</code>,{" "}
          <code>code</code>).
        </p>
      </blockquote>
      <ArgTypes of={SkuField} />
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, Sku, SkuField } from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <Sku skuCode="TSHIRTWS000000FFFFFFLXXX">
    <SkuField attribute="name" tagElement="h2" />
    <SkuField attribute="description" tagElement="p" />
    <SkuField attribute="image_url" tagElement="img" width={200} height={200} />
  </Sku>
</CommerceLayer>
`}
      />
      <hr />
      <h2>SkuListsContainer</h2>
      <p>
        <code>{"<SkuListsContainer>"}</code> fetches one or more SKU lists by
        ID and makes their SKU data available to child{" "}
        <code>{"<SkuList>"}</code> components. Each <code>{"<SkuList>"}</code>{" "}
        registers its own ID with this container on mount.
      </p>
      <blockquote>
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Accepts{" "}
          <code>{"<SkuList>"}</code> as children.
        </p>
      </blockquote>
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, SkuListsContainer } from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <SkuListsContainer>
    {/* <SkuList> components go here */}
  </SkuListsContainer>
</CommerceLayer>
`}
      />
      <hr />
      <h2>SkuList</h2>
      <p>
        <code>{"<SkuList>"}</code> registers its <code>id</code> with the
        parent <code>{"<SkuListsContainer>"}</code> and renders its children
        using the SKUs that belong to that list. Nest <code>{"<Skus>"}</code>{" "}
        and <code>{"<SkuField>"}</code> inside to display list items.
      </p>
      <blockquote>
        <p>
          Must be a child of <code>{"<SkuListsContainer>"}</code>. Accepts{" "}
          <code>{"<Skus>"}</code> and <code>{"<SkuField>"}</code> as children.
        </p>
      </blockquote>
      <ArgTypes of={SkuList} />
      <Source
        language="jsx"
        dark
        code={`
import {
  CommerceLayer,
  SkuListsContainer,
  SkuList,
  Skus,
  SkuField,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <SkuListsContainer>
    <SkuList id="yZjQIDxrly">
      <Skus>
        <SkuField attribute="name" tagElement="h2" />
        <SkuField attribute="code" tagElement="p" />
      </Skus>
    </SkuList>
  </SkuListsContainer>
</CommerceLayer>
`}
      />
    </>
  )
}

const meta = {
  title: "Skus/Sku",
  component: Sku,
  parameters: {
    layout: "centered",
    docs: {
      page: SkusDocsPage,
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

export const SkusContainerStory: Story = {
  name: "SkusContainer — name and code",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkusContainer
        skus={["TSHIRTWS000000FFFFFFLXXX", "TSHIRTWKFFFFFF000000MXXX"]}
      >
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

export const StandaloneSkuListStory: Story = {
  name: "SkuList — standalone (no container)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkuList id="yZjQIDxrly" params={{ fields: { skus: ["code", "name"] } }}>
        <Skus>
          <div style={{ marginBottom: 12 }}>
            <SkuField attribute="name" tagElement="h3" />
            <SkuField attribute="code" tagElement="p" />
          </div>
        </Skus>
      </SkuList>
    </CommerceLayer>
  ),
}

export const SkuListsContainerStory: Story = {
  name: "SkuListsContainer — list items",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkuListsContainer params={{ fields: { skus: ["code", "name"] } }}>
        <SkuList id="yZjQIDxrly">
          <Skus>
            <div style={{ marginBottom: 12 }}>
              <SkuField attribute="name" tagElement="h3" />
              <SkuField attribute="code" tagElement="p" />
            </div>
          </Skus>
        </SkuList>
      </SkuListsContainer>
    </CommerceLayer>
  ),
}

export const SkuFieldImageStory: Story = {
  name: "SkuField — image",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkusContainer skus={["TSHIRTWS000000FFFFFFLXXX"]}>
        <Skus>
          <SkuField
            attribute="image_url"
            tagElement="img"
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  ),
}
