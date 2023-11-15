import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { SkusContainer } from '#components/skus/SkusContainer'
import { Code } from '../_internals/Code'

const setup: Meta<typeof SkusContainer> = {
  title: 'Components/Skus/SkusContainer',
  component: SkusContainer
}

export default setup

const Template: StoryFn<typeof SkusContainer> = (args) => {
  return (
    <CommerceLayer
      accessToken='my-access-token'
      endpoint='https://demo-store.commercelayer.io'
    >
      <SkusContainer {...args}>
        <div>
          I am the skus container, responsible to fetch alls <Code>skus</Code>{' '}
          details and make them available to the children components.
        </div>
      </SkusContainer>
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  skus: ['POLOMXXX000000FFFFFFLXXX', 'CROPTOPWFFFFFF000000XSXX'],
  queryParams: {
    pageSize: 25,
    pageNumber: 1,
    fields: ['name', 'description', 'image_url', 'reference'],
    sort: {
      name: 'asc'
    }
  }
}
