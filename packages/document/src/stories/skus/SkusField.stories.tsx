import { Sku, SkuField } from "@commercelayer/react-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode } from "react"
import CommerceLayer from "../_internals/CommerceLayer"

function Wrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <CommerceLayer
      accessToken="my-access-token"
      endpoint="https://demo-store.commercelayer.io"
    >
      <Sku skuCode="POLOMXXX000000FFFFFFLXXX">{children}</Sku>
    </CommerceLayer>
  )
}

const meta = {
  title: "Skus/SkuField",
  component: SkuField,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    attribute: {
      control: "select",
      options: ["name", "code", "description", "image_url", "weight"],
      description: "SKU attribute to display",
    },
    tagElement: {
      control: "select",
      options: ["div", "p", "span", "img", "section"],
      description:
        "HTML tag to render. When set to `img`, the value fills the `src` attribute.",
    },
  },
} satisfies Meta<typeof SkuField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "SkuField — text attribute",
  args: {
    attribute: "name",
    tagElement: "div",
  },
  render: (args) => (
    <Wrapper>
      <SkuField {...args} />
    </Wrapper>
  ),
}

export const SkuImageAsImgTag: Story = {
  name: "SkuField — image_url as <img>",
  args: {
    attribute: "image_url",
    tagElement: "img",
    width: 100,
  },
  render: (args) => (
    <Wrapper>
      <SkuField {...args} />
    </Wrapper>
  ),
}

/**
 * Access the raw attribute value through the children render prop.
 * Useful for custom rendering — e.g. iterating over `metadata` JSON.
 */
export const ChildrenProps: Story = {
  name: "SkuField — children render prop",
  render: () => (
    <CommerceLayer
      accessToken="my-access-token"
      endpoint="https://demo-store.commercelayer.io"
    >
      <Sku skuCode="5PANECAP9D9CA1FFFFFFXXXX">
        <SkuField attribute="metadata" tagElement="div">
          {(childrenProps: any) => (
            <pre style={{ fontSize: "0.75rem" }}>
              {JSON.stringify(childrenProps, null, 2)}
            </pre>
          )}
        </SkuField>
      </Sku>
    </CommerceLayer>
  ),
}
