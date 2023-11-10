import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import Price from '#components/prices/Price'
import PricesContainer from '#components/prices/PricesContainer'

const setup: Meta<typeof Price> = {
  title: 'Components/Prices/Price',
  component: Price
}

export default setup

const Template: StoryFn<typeof Price> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <PricesContainer>
        <Price {...args} />
      </PricesContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skuCode: 'POST6191FFFFFF000000XXXX',
  compareClassName: 'line-through ml-2',
  className: 'font-bold'
}

/**
 * You can hide the `compare_at_amount` using the prop `showCompare`.
 * <span type='info'>
 * By default the prop is `true` and the `formatted_compare_at_amount` will always be displayed, when available.
 * </span>
 */
export const NoComparePrice = Template.bind({})
NoComparePrice.args = {
  skuCode: 'POST6191FFFFFF000000XXXX',
  showCompare: false
}

/**
 * In case you need to show a list of prices, you can add them in single `PricesContainer` component.
 */
export const MultiplePrices: StoryFn<typeof Price> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <PricesContainer>
        <div className='grid'>
          <Price skuCode='POST6191FFFFFF000000XXXX' showCompare={false} />
          <Price skuCode='POLOMXXX000000FFFFFFLXXX' showCompare={false} />
        </div>
      </PricesContainer>
    </CommerceLayer>
  )
}
MultiplePrices.args = {}

/**
 * You can access the `price` object using the children props, that gives you access to an array of `prices`.
 * In this way you will be able to apply your own logic when displaying the price.
 * <span type='info'>
 * Check the price resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/prices/object).
 * </span>
 */
export const ChildrenProps: StoryFn<typeof Price> = (args) => {
  return (
    <Price {...args}>
      {(childrenProps) => {
        if (childrenProps.loading) {
          return <div>Fetching prices...</div>
        }

        return (
          <div>
            <p>The price object</p>
            {childrenProps.prices.map((price) => (
              <pre key={price.id}>{JSON.stringify(price, null, 2)}</pre>
            ))}
          </div>
        )
      }}
    </Price>
  )
}

ChildrenProps.args = {
  skuCode: 'POST6191FFFFFF000000XXXX'
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
