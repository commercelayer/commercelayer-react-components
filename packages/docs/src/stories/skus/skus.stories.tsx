import { SkuField, SkuList, Skus } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkusDocsPage(): JSX.Element {
  return (
    <>
      <h1>Skus</h1>
      <p>
        <code>{"<Skus>"}</code> iterates over every SKU fetched by its parent container and renders
        its children once per record — no manual looping required.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a direct child of <code>{"<SkuList>"}</code>. Accepts <code>{"<SkuField>"}</code>{" "}
          as children.
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
      {/* rendered once per SKU */}
      <SkuField attribute="name" tagElement="h3" />
      <SkuField attribute="code" tagElement="p" />
    </Skus>
  </SkuList>
</CommerceLayer>
`}
      />
      <Canvas of={Default} />
    </>
  )
}

const meta = {
  title: "Components/Skus/Skus",
  component: Skus,
  parameters: {
    layout: "centered",
    docs: {
      page: SkusDocsPage,
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "Rendered once per SKU. Accepts `<SkuField>` as children.",
    },
  },
} satisfies Meta<typeof Skus>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Skus — inside SkuList",
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
