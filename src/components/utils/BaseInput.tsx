import React, { FunctionComponent } from 'react'
import { BaseInputComponentPropTypes } from '../../@types/index'
import Parent from './Parent'
import { PropsType } from '../../utils/PropsType'

export type BaseInputProps = PropsType<typeof BaseInputComponentPropTypes> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const BaseInput: FunctionComponent<BaseInputProps> = props => {
  const { children, ...p } = props
  const input =
    props.type === 'textarea' ? <textarea {...p} /> : <input {...p} />
  return children ? <Parent {...p}>{children}</Parent> : input
}

BaseInput.propTypes = BaseInputComponentPropTypes

export default BaseInput
