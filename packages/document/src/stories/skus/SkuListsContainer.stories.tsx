import { SkuField, SkuList, SkuListsContainer, Skus } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function SkuListsContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>SkuListsContainer</h1>
      <span title="Deprecated" type="warning">
        <p>
          Use the standalone <code>{'<SkuList id="...">'}</code> component instead — it fetches its
          own data without requiring a container parent. See <strong>Skus/SkuList</strong> for the
          recommended pattern. <code>{"<SkuListsContainer>"}</code> will be removed in the next
          major version.
        </p>
      </span>
      <p>
        <code>{"<SkuListsContainer>"}</code> fetches one or more SKU lists by ID and makes their SKU
        data available to child <code>{"<SkuList>"}</code> components. Each{" "}
        <code>{"<SkuList>"}</code> registers its own ID with this container on mount.
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
      <p>
        <strong>After (recommended):</strong>
      </p>
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
      <hr />
      <h2>Example</h2>
      <Canvas of={SkuListsContainerStory} />
    </>
  )
}

const meta = {
  title: "Components/Skus/SkuListsContainer",
  component: SkuListsContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: SkuListsContainerDocsPage,
    },
  },
  argTypes: {
    params: {
      control: "object",
      description:
        "Optional query parameters forwarded to each SKU list retrieval call. `include: [\"skus\"]` is always enforced. Use `fields.skus` to request additional SKU attributes.",
    },
    children: {
      control: false,
      description: "Accepts `<SkuList>` as children.",
    },
  },
} satisfies Meta<typeof SkuListsContainer>

export default meta
type Story = StoryObj<typeof meta>

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
