import type { Meta, StoryObj } from '@storybook/react'
import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import Price from '@commercelayer/react-components/prices/Price'
import PricesContainer from '@commercelayer/react-components/prices/PricesContainer'
import useGetToken from '../hooks/useGetToken'
import React from 'react'

interface MetaProps {
  /**
   * The skuCode of the price to be fetched
   */
  skuCode: string
  accessToken?: string
  endpoint?: string
}

const meta: Meta<MetaProps> = {
  /* 👇 The title prop is optional.
   * Seehttps://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Price',
  args: {
    skuCode: 'BABYONBU000000E63E7412MX',
    accessToken: undefined,
    endpoint: undefined
  },
  argTypes: {
    skuCode: {
      description: 'The skuCode of the price to be fetched',
      type: { name: 'string', required: true },
      defaultValue: 'BABYONBU000000E63E7412MX'
    },
    accessToken: {
      description: 'The access token to be used for the API calls',
      type: { name: 'string', required: false },
      defaultValue: undefined
    },
    endpoint: {
      description: 'The endpoint to be used for the API calls',
      type: { name: 'string', required: false },
      defaultValue: undefined
    }
  }
}

export default meta
type Story = StoryObj<MetaProps>

// 👇 The PriceTemplate construct will be spread to the existing stories.
const PriceTemplate: Story = {
  render: ({ skuCode, accessToken, endpoint }) => {
    const { accessToken: defaultToken, endpoint: defaultEndpoint } =
      useGetToken()
    return (
      <CommerceLayer
        accessToken={accessToken ?? defaultToken}
        endpoint={endpoint ?? defaultEndpoint}
      >
        <PricesContainer>
          <Price skuCode={skuCode} />
        </PricesContainer>
      </CommerceLayer>
    )
  }
}

export const GetSinglePrice = {
  ...PriceTemplate
}
