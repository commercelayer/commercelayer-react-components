import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types/index'

export interface SubmitButtonProps extends BaseComponent {
  label?: string
  children?: FunctionComponent
}

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

SubmitButton.propTypes = {
  children: PropTypes.func,
  label: PropTypes.string
}

SubmitButton.defaultProps = {
  label: 'submit'
}

export default SubmitButton
