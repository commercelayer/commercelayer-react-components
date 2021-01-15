import React, { FunctionComponent } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'

const propTypes = components.SubmitButton.propTypes
const defaultProps = components.SubmitButton.defaultProps
const displayName = components.SubmitButton.displayName

type SubmitButtonChildrenProps = FunctionChildren<
  Omit<SubmitButtonProps, 'children'>
>

type SubmitButtonProps = {
  children?: SubmitButtonChildrenProps
  label?: string
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
      {label}
    </button>
  )
}

SubmitButton.propTypes = propTypes
SubmitButton.defaultProps = defaultProps
SubmitButton.displayName = displayName

export default SubmitButton
