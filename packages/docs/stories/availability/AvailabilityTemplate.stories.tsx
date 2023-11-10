import type { Meta, StoryFn, StoryObj } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { AvailabilityTemplate } from '#components/skus/AvailabilityTemplate'
import { AvailabilityContainer } from '#components/skus/AvailabilityContainer'
import PricesContainer from '#components/prices/PricesContainer'

const setup: Meta<typeof AvailabilityTemplate> = {
  title: 'Components/Availability/AvailabilityTemplate',
  component: AvailabilityTemplate,
  argTypes: {
    showShippingMethodName: {
      control: 'boolean'
    },
    showShippingMethodPrice: {
      control: 'boolean'
    },
    timeFormat: {
      control: 'radio',
      options: ['days', 'hours', undefined]
    }
  }
}

export default setup

const Template: StoryFn<typeof AvailabilityTemplate> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <AvailabilityContainer skuCode='POLOMXXX000000FFFFFFLXXX'>
        <AvailabilityTemplate {...args} />
      </AvailabilityContainer>
    </CommerceLayer>
  )
}

export const AvailableWithDeliveryTime = Template.bind({})
AvailableWithDeliveryTime.args = {
  timeFormat: 'days',
  showShippingMethodName: true,
  showShippingMethodPrice: true
}

/**
 * You can customize the text displayed in case of `available`, `outOfStock` or `negativeStock`, using custom `labels`.
 */
export const WithCustomLabel = Template.bind({})
WithCustomLabel.args = {
  labels: {
    available: 'Item is available'
  }
}

/**
 * When `sku` is not available, the `delivery_lead_time` will not be displayed.
 */
export const NotAvailable: StoryFn<typeof AvailabilityTemplate> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <AvailabilityContainer skuCode='TSHIRTWV000000FFFFFFSXXX'>
        <AvailabilityTemplate
          timeFormat='days'
          showShippingMethodName
          showShippingMethodPrice
        />
      </AvailabilityContainer>
    </CommerceLayer>
  )
}

/**
 * You can access the `delivery_lead_times` object using the children props.
 * In this way you will be able to apply your own logic when displaying the availability info.
 * <span type='info'>
 * Check the `delivery_lead_times` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/delivery_lead_times/object).
 * </span>
 */
export const ChildrenProps: StoryObj = () => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <AvailabilityContainer skuCode='POLOMXXX000000FFFFFFLXXX'>
        <AvailabilityTemplate>
          {(childrenProps) => {
            return (
              <div>
                <p className='font-bold'>Custom logic:</p>
                <p className='mb-8'>
                  {childrenProps.quantity} items available delivered in{' '}
                  {childrenProps.min?.hours} hours
                </p>
                <p className='font-bold'>The delivery_lead_times object</p>
                <pre>{JSON.stringify(childrenProps, null, 2)}</pre>
              </div>
            )
          }}
        </AvailabilityTemplate>
      </AvailabilityContainer>
    </CommerceLayer>
  )
}
ChildrenProps.decorators = [
  (Story) => {
    return (
      <CommerceLayer
        accessToken='my-access-token'
        endpoint='https://demo-store.commercelayer.io'
      >
        <PricesContainer>
          <Story />
        </PricesContainer>
      </CommerceLayer>
    )
  }
]
ChildrenProps.parameters = {
  docs: {
    source: {
      type: 'code'
    }
  }
}
