import { useGlobals, useStorybookApi } from '@storybook/api'
import { IconButton, Icons } from '@storybook/components'
import React, { useCallback, useEffect } from 'react'
import { ADDON_ID, ADDON_NAME, PARAM_KEY, TOOL_ID } from './constants'

export const Tool = () => {
  const [globals, updateGlobals] = useGlobals()
  const active = globals[PARAM_KEY] === true || globals[PARAM_KEY] === 'true'
  const api = useStorybookApi()

  const toggleContainer = useCallback(
    () =>
      updateGlobals({
        [PARAM_KEY]: !active,
      }),
    [updateGlobals, active]
  )

  useEffect(() => {
    api.setAddonShortcut(ADDON_ID, {
      label: 'Toggle Container [C]',
      defaultShortcut: ['C'],
      actionName: 'container',
      showInMenu: false,
      action: toggleContainer,
    })
  }, [toggleContainer, api])

  return (
    <IconButton
      key={TOOL_ID}
      active={active}
      title={ADDON_NAME}
      onClick={toggleContainer}
    >
      <Icons icon="box" />
    </IconButton>
  )
}
