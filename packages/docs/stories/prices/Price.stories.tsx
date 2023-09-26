import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '#components/auth/CommerceLayer'
import Price from '#components/prices/Price'
import PricesContainer from '#components/prices/PricesContainer'
import useGetToken from '../hooks/useGetToken'

const setup: Meta<typeof Price> = {
  title: 'Components/Price',
  component: Price
}

export default setup

const Template: StoryFn<typeof Price> = (args) => {
  const { accessToken, endpoint } = useGetToken()
  return (
    <CommerceLayer accessToken={accessToken} endpoint={endpoint}>
      <PricesContainer>
        <Price {...args} />
      </PricesContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skuCode: 'BABYONBU000000E63E7412MX',
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
  skuCode: 'BABYONBU000000E63E7412MX',
  showCompare: false
}

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
  skuCode: 'BABYONBU000000E63E7412MX'
}
ChildrenProps.decorators = [
  (Story) => {
    const { accessToken, endpoint } = useGetToken()
    return (
      <CommerceLayer accessToken={accessToken} endpoint={endpoint}>
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
