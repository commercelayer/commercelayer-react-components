import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../../@types/index'
import Parent from './Parent'

export type BaseInputType = 'text' | 'email' | 'number' | 'date' | 'checkbox'

export interface BaseInputProps extends BaseComponent {
  name: string
  type: BaseInputType
  children?: FunctionComponent
}

const BaseInput: FunctionComponent<BaseInputProps> = props => {
  const { children, ...p } = props
  return children ? <Parent {...p}>{children}</Parent> : <input {...p} />
}

BaseInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'email',
    'number',
    'date',
    'checkbox'
  ]).isRequired
}

export default BaseInput
