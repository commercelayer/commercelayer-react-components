import { addons, types } from "@storybook/manager-api"
import React from "react"
import { Tool } from "./Tool"
import { ADDON_ID, ADDON_NAME } from "./constants"

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: ADDON_NAME,
    type: types.TOOL,
    match: ({ viewMode }) => !!viewMode?.match(/^(story|docs)$/),
    render: () => <Tool />,
  })
})
