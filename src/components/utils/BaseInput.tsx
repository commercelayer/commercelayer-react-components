import React, { FunctionComponent } from 'react'
import {
  BaseInputComponentPropTypes,
  BaseInputComponentProps,
} from '../../typings/index'
import Parent from './Parent'

export type BaseInputProps = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const BaseInput: FunctionComponent<BaseInputProps> = (props) => {
  const { children, ...p } = props
  const input =
    props.type === 'textarea' ? <textarea {...p} /> : <input {...p} />
  return children ? <Parent {...p}>{children}</Parent> : input
}

BaseInput.propTypes = BaseInputComponentPropTypes

export default BaseInput
