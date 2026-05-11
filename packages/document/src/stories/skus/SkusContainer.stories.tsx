import {
  SkuField,
  Skus,
  SkusContainer,
} from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Skus/SkusContainer",
  component: SkusContainer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "⚠️ **Deprecated.** Use the standalone `<Sku skuCode=\"...\">` component instead — it handles batching automatically. `<SkusContainer>` will be removed in the next major version.",
      },
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
