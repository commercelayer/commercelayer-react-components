import React, { FunctionComponent } from 'react'
import Parent from './utils/Parent'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.SubmitButton.propTypes
const defaultProps = components.SubmitButton.defaultProps
const displayName = components.SubmitButton.displayName

export type SubmitButtonProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['button']

const SubmitButton: FunctionComponent<SubmitButtonProps> = (props) => {
  const { children, label, ...p } = props
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
