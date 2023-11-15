import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import MyIdentityLink from '#components/customers/MyIdentityLink'
import { Code } from 'stories/_internals/Code'
import {
  Description,
  Subtitle,
  Title,
  Controls,
  Primary
} from '@storybook/addon-docs'

const setup: Meta<typeof MyIdentityLink> = {
  title: 'Components/Customers/MyIdentityLink',
  component: MyIdentityLink,

  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Instructions />
          <Controls />
        </>
      )
    }
  }
}

export default setup

const Template: StoryFn<typeof MyIdentityLink> = (args) => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <MyIdentityLink {...args} />
    </CommerceLayer>
  )
}

export const Default = Template.bind({})
Default.args = {
  label: 'Open my-identity app',
  target: '_blank',
  onClick: () => {},
  className: 'text-blue-500 hover:underline',
  returnUrl: '',
  clientId: '',
  type: 'signup',
  scope: ''
}

Default.decorators = [
  (Story) => {
    return (
      <div>
        <Story />
      </div>
    )
  }
]

const Instructions = (): JSX.Element => (
  <div className='mb-4'>
    {/* @ts-expect-error add a note of type `info` just for documenting the use case */}
    <span title='How to use' type='warning'>
      Fill the table of values below with a valid <Code>clientId</Code>,{' '}
      <Code>scope</Code> and <Code>returnUrl</Code> from your organization to
      see the link in action. <br />
      <br />
      As return url you can use our hosted mfe-my-account: <br />
      <Code>
        https://&lt;organization-slug&gt;.commercelayer.app/my-account
      </Code>
    </span>
  </div>
)
