import React, { FunctionComponent, ReactNode } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import isFunction from 'lodash/isFunction'

const propTypes = components.SubmitButton.propTypes
const defaultProps = components.SubmitButton.defaultProps
const displayName = components.SubmitButton.displayName

type SubmitButtonChildrenProps = FunctionChildren<
  Omit<SubmitButtonProps, 'children'>
>

type SubmitButtonProps = {
  children?: SubmitButtonChildrenProps
  label?: string | ReactNode
} & JSX.IntrinsicElements['button']

const SubmitButton: FunctionComponent<SubmitButtonProps> = (props) => {
  const { children, label = 'Submit', ...p } = props
  const parentProps = {
    ...p,
    label,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="submit" {...p}>
      {isFunction(label) ? label() : label}
    </button>
  )
}

SubmitButton.propTypes = propTypes
SubmitButton.defaultProps = defaultProps
SubmitButton.displayName = displayName

export default SubmitButton
