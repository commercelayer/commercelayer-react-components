import { type Meta, type StoryFn, type StoryObj } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { Skus } from '#components/skus/Skus'
import { SkusContainer } from '#components/skus/SkusContainer'
import { SkuField } from '#components/skus/SkuField'

const setup: Meta<typeof SkuField> = {
  title: 'Components/Skus/SkuField',
  component: SkuField,
  argTypes: {
    attribute: {
      control: 'select',
      options: ['name', 'code', 'description', 'image_url', 'weight'],
      description: 'Resource attribute to display'
    },
    tagElement: {
      control: 'select',
      options: ['div', 'p', 'span', 'img', 'section'],
      description:
        'Resource attribute to displayHtml tag to render. When tag is `img` the value will be used to fill the `src` attribute.'
    }
  }
}

export default setup

const Template: StoryFn<typeof SkuField> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <SkusContainer skus={['POLOMXXX000000FFFFFFLXXX']}>
        <Skus>
          <SkuField {...args} />
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  attribute: 'name',
  tagElement: 'div'
}

/**
 * The `image_url` can be displayed as `<img>` tag by setting `tagElement` prop to `img`.
 * In general you can use the `tagElement` you prefer to render the `attribute` you need.
 */
export const SkuImageAsImgTag = Template.bind({})
SkuImageAsImgTag.args = {
  attribute: 'image_url',
  tagElement: 'img',
  width: 100
}

/**
 * You can access the attribute value using the children props.
 * In this way you will be able to apply your own logic if the default rendering is not enough.
 * <span title='Metadata' type='info'>
 * Using the children props is a good idea when you need to render skus' `metadata` the are usually stored as a JSON object or array.
 * In this way you can access `childrenProps.attributeValue` and cycle through the object/array.
 * </span>
 */
export const ChildrenProps: StoryObj = () => {
  return (
    <SkuField attribute='metadata' tagElement='div'>
      {(childrenProps: any) => {
        return <pre>{JSON.stringify(childrenProps, null, 2)}</pre>
      }}
    </SkuField>
  )
}
ChildrenProps.decorators = [
  (Story) => {
    return (
      <CommerceLayer
        accessToken='my-access-token'
        endpoint='https://demo-store.commercelayer.io'
      >
        <SkusContainer skus={['5PANECAP9D9CA1FFFFFFXXXX']}>
          <Skus>
            <Story />
          </Skus>
        </SkusContainer>
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
