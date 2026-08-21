import {
  Availability,
  AvailabilityContainer,
  AvailabilityTemplate,
} from "@commercelayer/react-components"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import type { Meta, StoryObj } from "@storybook/react-vite"
import CommerceLayer from "../_internals/CommerceLayer"

function AvailabilityContainerDocsPage(): JSX.Element {
  return (
    <>
      <h1>AvailabilityContainer</h1>
      <span title="Deprecated" type="warning">
        <p>
          <code>{"<AvailabilityContainer>"}</code> is deprecated. Use the standalone{" "}
          <code>{"<Availability skuCode='...'>"}</code> component instead. See{" "}
          <strong>Availability/Availability</strong> for the recommended pattern.{" "}
          <code>{"<AvailabilityContainer>"}</code> will be removed in the next major version.
        </p>
      </span>
      <p>
        <code>{"<AvailabilityContainer>"}</code> fetches inventory data for a given SKU code and
        makes it available to its <code>{"<AvailabilityTemplate>"}</code> children via context.
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
import { CommerceLayer, AvailabilityContainer, AvailabilityTemplate } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <AvailabilityContainer skuCode="TSHIRTMM000000FFFFFFXLXX">
    <AvailabilityTemplate />
  </AvailabilityContainer>
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
import { CommerceLayer, Availability, AvailabilityTemplate } from '@commercelayer/react-components'

<CommerceLayer accessToken="...">
  <Availability skuCode="TSHIRTMM000000FFFFFFXLXX">
    <AvailabilityTemplate />
  </Availability>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Example</h2>
      <Canvas of={DeprecatedContainer} />
    </>
  )
}

const meta = {
  title: "Components/Availability/AvailabilityContainer",
  component: AvailabilityContainer,
  parameters: {
    layout: "centered",
    docs: {
      page: AvailabilityContainerDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description: "The SKU code to fetch availability for.",
    },
    skuId: {
      control: "text",
      description:
        "The SKU resource ID. Takes precedence over `skuCode` and improves performance by skipping the code-to-id lookup.",
    },
    children: {
      control: false,
      description: "Accepts `<AvailabilityTemplate>` as a child.",
    },
  },
} satisfies Meta<typeof AvailabilityContainer>

export default meta
type Story = StoryObj<typeof meta>

export const DeprecatedContainer: Story = {
  name: "AvailabilityContainer — deprecated (legacy)",
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <AvailabilityContainer skuCode="POLOMXXX000000FFFFFFLXXX">
        <AvailabilityTemplate />
      </AvailabilityContainer>
    </CommerceLayer>
  ),
}
