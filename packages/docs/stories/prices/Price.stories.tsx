import { ComponentMeta, type ComponentStory } from '@storybook/react'

import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import PricesContainer from '@commercelayer/react-components/prices/PricesContainer'
import { Price as PriceComponent } from '@commercelayer/react-components/prices/Price'
import useGetToken from '../hooks/useGetToken'
import { skus } from '../assets/config'

const Story: ComponentMeta<typeof PriceComponent> = {
  title: 'Components/Prices/Price',
  component: PriceComponent,
  argTypes: {
    skuCode: {
      description: 'SKU is a unique identifier, meaning Stock Keeping Unit.',
      type: { name: 'string', required: false },
      table: {
        category: 'attributes'
      }
    },
    showCompare: {
      description: 'SKU is a unique identifier, meaning Stock Keeping Unit.',
      type: { name: 'boolean', required: false },
      table: {
        category: 'attributes'
      }
    }
  }
}

export default Story

const Template: ComponentStory<typeof PriceComponent> = (arg) => {
  const config = useGetToken()
  return (
    <CommerceLayer {...config}>
      <PricesContainer>
        <PriceComponent {...arg} />
      </PricesContainer>
    </CommerceLayer>
  )
}

export const Price = Template.bind({})
Price.args = { skuCode: skus.withAvailabilities, showCompare: false }
