// biome-ignore lint/correctness/noUnusedImports: React is used in the render method
import React from "react"
import { addons, types } from "storybook/manager-api"
import { ADDON_ID, ADDON_NAME } from "./constants"
import { Tool } from "./Tool"

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: ADDON_NAME,
    type: types.TOOL,
    match: ({ viewMode }) => !!viewMode?.match(/^(story|docs)$/),
    render: () => <Tool />,
  })
})
