import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../_internals/CommerceLayer'
import { Skus } from '#components/skus/Skus'
import { SkusContainer } from '#components/skus/SkusContainer'
import { Code } from 'stories/_internals/Code'

const setup: Meta<typeof Skus> = {
  title: 'Components/Skus/Skus',
  component: Skus
}

export default setup

export const Default: StoryFn<typeof Skus> = () => {
  return (
    <CommerceLayer accessToken='my-access-token'>
      <SkusContainer
        skus={['POLOMXXX000000FFFFFFLXXX', 'CROPTOPWFFFFFF000000XSXX']}
      >
        <Skus>
          <div>
            I am <Code>Skus</Code> child
          </div>
        </Skus>
      </SkusContainer>
    </CommerceLayer>
  )
}
