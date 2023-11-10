import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { AvailabilityContainer } from '#components/skus/AvailabilityContainer'

const setup: Meta<typeof AvailabilityContainer> = {
  title: 'Components/Availability/AvailabilityContainer',
  component: AvailabilityContainer
}

export default setup

const Template: StoryFn<typeof AvailabilityContainer> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <AvailabilityContainer {...args}>...</AvailabilityContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skuCode: 'POLOMXXX000000FFFFFFLXXX',
  getQuantity: (quantity) => {
    console.log('quantity', quantity)
  }
}
Default.parameters = {
  docs: {
    canvas: {
      sourceState: 'shown'
    }
  }
}
