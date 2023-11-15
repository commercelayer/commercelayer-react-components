import { A, IconButton, Icons, Separator } from '@storybook/components'
import React from 'react'
import { ADDON_NAME, REPOSITORY_URL, TOOL_ID } from './constants'

export const Tool = () => {
  return (
    <>
      <Separator />
      <IconButton
        key={TOOL_ID}
        active={false}
        title={ADDON_NAME}
      >
        
        <A target='_blank' href={REPOSITORY_URL}>
          <Icons icon="github" />&nbsp;&nbsp;repository
        </A>
      </IconButton>
    </>
  )
}
