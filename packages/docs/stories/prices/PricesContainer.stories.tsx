import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import PricesContainer from '#components/prices/PricesContainer'
import Price from '#components/prices/Price'

const setup: Meta<typeof PricesContainer> = {
  title: 'Components/Prices/PricesContainer',
  component: PricesContainer
}

export default setup

const Template: StoryFn<typeof PricesContainer> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <PricesContainer {...args}>
        <Price />
      </PricesContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skuCode: 'BABYONBU000000E63E7412MX'
}
