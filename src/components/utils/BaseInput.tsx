import React, { FunctionComponent, ChangeEvent } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../../@types/index'
import Parent from './Parent'

export type BaseInputType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'textarea'

export interface BaseInputProps extends BaseComponent {
  name: string
  type: BaseInputType
  children?: FunctionComponent
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

const BaseInput: FunctionComponent<BaseInputProps> = props => {
  const { children, ...p } = props
  const input =
    props.type === 'textarea' ? <textarea {...p} /> : <input {...p} />
  return children ? <Parent {...p}>{children}</Parent> : input
}

BaseInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'email',
    'number',
    'date',
    'checkbox',
    'textarea'
  ]).isRequired,
  onChange: PropTypes.func
}

export default BaseInput
