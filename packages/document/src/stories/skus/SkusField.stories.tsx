import { Sku, SkuField } from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
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

function SkuFieldDocsPage(): JSX.Element {
  return (
    <>
      <h1>SkuField</h1>
      <p>
        <code>{"<SkuField>"}</code> renders any attribute of the current SKU
        provided by a parent <code>{"<Sku>"}</code> (or the deprecated{" "}
        <code>{"<SkusContainer>"}</code>) context. Use the{" "}
        <code>attribute</code> prop to select which field to display and{" "}
        <code>tagElement</code> to choose the HTML tag (defaults to{" "}
        <code>span</code>). When <code>{'tagElement="img"'}</code>, the value
        is used as the <code>src</code> and standard{" "}
        <code>{"<img>"}</code> props (<code>width</code>, <code>height</code>,
        etc.) are forwarded.
      </p>
      <blockquote>
        <p>
          Must be a descendant of <code>{"<Sku>"}</code> or{" "}
          <code>{"<SkusContainer>"}</code>. See the{" "}
          <a href="https://docs.commercelayer.io/core/v/api-reference/skus/object">
            SKUs API object
          </a>{" "}
          for all available attributes (e.g. <code>name</code>,{" "}
          <code>description</code>, <code>image_url</code>,{" "}
          <code>code</code>, <code>metadata</code>).
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
      <h2>Text attribute</h2>
      <p>
        Any string attribute (e.g. <code>name</code>, <code>code</code>,{" "}
        <code>description</code>) is rendered as the text content of the chosen
        tag.
      </p>
      <Canvas of={Default} />
      <hr />
      <h2>Image attribute</h2>
      <p>
        Set <code>{'tagElement="img"'}</code> to render <code>image_url</code>{" "}
        as an <code>{"<img>"}</code> element. Pass standard image props like{" "}
        <code>width</code> and <code>height</code> directly.
      </p>
      <Canvas of={SkuImageAsImgTag} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to receive the raw attribute
        value and apply your own rendering logic — useful for complex types like{" "}
        <code>metadata</code> (JSON objects or arrays).
      </p>
      <Canvas of={ChildrenProps} />
    </>
  )
}

const meta = {
  title: "Skus/SkuField",
  component: SkuField,
  parameters: {
    layout: "centered",
    docs: {
      page: SkuFieldDocsPage,
    },
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
