import React, { type ForwardRefRenderFunction } from 'react'
import { type BaseInputComponentProps } from '#typings/index'
import Parent from './Parent'

export type BaseInputProps = BaseInputComponentProps &
  Omit<JSX.IntrinsicElements['input'], 'children'> &
  Omit<JSX.IntrinsicElements['textarea'], 'children'>

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
    <Parent parentRef={ref} {...p}>
      {children}
    </Parent>
  ) : (
    input
  )
}

export default React.forwardRef(BaseInput)
