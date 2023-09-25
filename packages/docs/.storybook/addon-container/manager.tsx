import { addons, types } from '@storybook/addons'
import React from 'react'
import { ADDON_ID, ADDON_NAME } from './constants'
import { Tool } from './Tool'

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: ADDON_NAME,
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => <Tool />,
  })
})
