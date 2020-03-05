import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types/index'

const SBProps = {
  children: PropTypes.func,
  label: PropTypes.string
}

export type SubmitButtonProps = InferProps<typeof SBProps> & BaseComponent

const SubmitButton: FunctionComponent<SubmitButtonProps> = props => {
  const { children, label, ...p } = props
  const parentProps = {
    ...p,
    label
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="submit" {...p}>
      {label}
    </button>
  )
}

SubmitButton.propTypes = SBProps

SubmitButton.defaultProps = {
  label: 'submit'
}

export default SubmitButton
