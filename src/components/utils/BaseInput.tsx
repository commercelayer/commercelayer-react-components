import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { BaseComponent } from '../../@types/index'
import Parent from './Parent'

export type BaseInputType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'textarea'

export const BIProps = {
  children: PropTypes.func,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'email',
    'number',
    'date',
    'checkbox',
    'textarea'
  ]).isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}

export type BaseInputProps = InferProps<typeof BIProps> & BaseComponent

const BaseInput: FunctionComponent<BaseInputProps> = props => {
  const { children, ...p } = props
  const input =
    props.type === 'textarea' ? <textarea {...p} /> : <input {...p} />
  return children ? <Parent {...p}>{children}</Parent> : input
}

BaseInput.propTypes = BIProps

export default BaseInput
