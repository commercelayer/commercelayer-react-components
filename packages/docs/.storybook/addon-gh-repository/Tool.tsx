import { GithubIcon } from "@storybook/icons"
// biome-ignore lint/correctness/noUnusedImports: React is used in the render method
import React from "react"
import { A, IconButton, Separator } from "storybook/internal/components"
import { ADDON_NAME, REPOSITORY_URL, TOOL_ID } from "./constants"

export const Tool = () => {
  return (
    <>
      <Separator />
      <IconButton key={TOOL_ID} active={false} title={ADDON_NAME}>
        <A target="_blank" href={REPOSITORY_URL}>
          <GithubIcon />
          &nbsp;&nbsp;repository
        </A>
      </IconButton>
    </>
  )
}
