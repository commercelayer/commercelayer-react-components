import { ComponentMeta, type ComponentStory } from '@storybook/react'
import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import { PricesContainer as PricesContainerComponent } from '@commercelayer/react-components/prices/PricesContainer'
import Price from '@commercelayer/react-components/prices/Price'
import useGetToken from '../hooks/useGetToken'
import { skus } from '../assets/config'

const Story: ComponentMeta<typeof PricesContainerComponent> = {
  title: 'Components/Prices/PricesContainer',
  component: PricesContainerComponent,
  argTypes: {
    skuCode: {
      description: 'SKU is a unique identifier, meaning Stock Keeping Unit.',
      type: { name: 'string', required: false },
      table: {
        category: 'attributes'
      }
    }
  }
}

export default Story

const Template: ComponentStory<typeof PricesContainerComponent> = (arg) => {
  const config = useGetToken()
  return (
    <CommerceLayer {...config}>
      <PricesContainerComponent {...arg}>
        <Price />
      </PricesContainerComponent>
    </CommerceLayer>
  )
}

export const PricesContainer = Template.bind({})
PricesContainer.args = { skuCode: skus.withAvailabilities }
