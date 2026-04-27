import {
  Sku,
  SkuField,
  SkuList,
  SkuListsContainer,
  Skus,
  SkusContainer,
} from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

const meta = {
  title: "Skus/Stories",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

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
