import React, { type ForwardRefRenderFunction, type JSX } from 'react';
import type { BaseInputComponentProps } from '#typings/index'
import Parent from './Parent'

export type BaseInputProps = BaseInputComponentProps &
  Omit<JSX.IntrinsicElements['input'], 'children' | 'pattern'> &
  Omit<JSX.IntrinsicElements['textarea'], 'children' | 'pattern'>

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
