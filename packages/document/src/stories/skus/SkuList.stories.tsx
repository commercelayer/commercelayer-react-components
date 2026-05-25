import { SkuField, SkuList, Skus } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkuListDocsPage(): JSX.Element {
  return (
    <>
      <h1>SkuList</h1>
      <p>
        <code>{"<SkuList>"}</code> fetches and renders SKUs belonging to a Commerce Layer SKU list.
        It can be used as a standalone component — pass the SKU list <code>id</code> directly and
        nest <code>{"<Skus>"}</code> inside to iterate over the list items.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<CommerceLayer>"}</code>. Accepts <code>{"<Skus>"}</code> and{" "}
          <code>{"<SkuField>"}</code> as children.
        </p>
      </span>
      <ArgTypes />
      <hr />
      <h2>Example</h2>
      <Source
        language="jsx"
        dark
        code={`
import { CommerceLayer, SkuList, Skus, SkuField } from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <SkuList id="yZjQIDxrly">
    <Skus>
      <SkuField attribute="name" tagElement="h2" />
      <SkuField attribute="code" tagElement="p" />
    </Skus>
  </SkuList>
</CommerceLayer>
`}
      />
      <Canvas of={StandaloneSkuList} />
    </>
  )
}

const meta = {
  title: "Components/Skus/SkuList",
  component: SkuList,
  parameters: {
    layout: "centered",
    docs: {
      page: SkuListDocsPage,
    },
  },
  argTypes: {
    id: {
      control: "text",
      description: "The ID of the SKU list to fetch.",
    },
    params: {
      control: "object",
      description:
        'Optional query parameters forwarded to the SKU list retrieval call. `include: ["skus"]` is always enforced. Use `fields.skus` to request additional SKU attributes.',
    },
    loader: {
      control: "text",
      description: "Content displayed while the SKU list data is loading.",
    },
    children: {
      control: false,
      description: "Accepts `<Skus>` and `<SkuField>` as children.",
    },
  },
} satisfies Meta<typeof SkuList>

export default meta
type Story = StoryObj<typeof meta>

export const StandaloneSkuList: Story = {
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
