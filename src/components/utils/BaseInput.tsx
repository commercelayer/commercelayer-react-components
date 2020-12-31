import React, { ForwardRefRenderFunction } from 'react'
import { BaseInputComponentProps } from '@typings/index'
import Parent from './Parent'

export type BaseInputProps = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const BaseInput: ForwardRefRenderFunction<any, BaseInputProps> = (
  props,
  ref
) => {
  const { children, ...p } = props
  const input =
    props.type === 'textarea' ? (
      <textarea ref={ref} {...p} />
    ) : (
      <input ref={ref} {...p} />
    )
  return children ? (
    <Parent ref={ref} {...p}>
      {children}
    </Parent>
  ) : (
    input
  )
}

export default React.forwardRef(BaseInput)
