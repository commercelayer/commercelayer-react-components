import type { Meta, StoryObj } from '@storybook/react-vite'
import CommerceLayer from '../_internals/CommerceLayer'
import {
  SkuField,
  SkuList,
  SkuListsContainer,
  Skus,
  SkusContainer,
} from '@commercelayer/react-components'

const meta = {
  title: 'Skus/Stories',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SkusContainerStory: Story = {
  name: 'SkusContainer — name and code',
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkusContainer skus={['TSHIRTMM000000FFFFFFXLXX', 'PANTSMM000000FFFFFFXXXX']}>
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

export const SkuListsContainerStory: Story = {
  name: 'SkuListsContainer — list items',
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkuListsContainer>
        <SkuList id="SkuListAbc01">
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
  name: 'SkuField — image',
  render: () => (
    <CommerceLayer accessToken="my-access-token">
      <SkusContainer skus={['TSHIRTMM000000FFFFFFXLXX']}>
        <Skus>
          <SkuField
            attribute="image_url"
            tagElement="img"
            width={200}
            height={200}
            style={{ objectFit: 'contain' }}
          />
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  ),
}
