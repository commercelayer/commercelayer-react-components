import React, { ForwardRefRenderFunction } from 'react'
import Parent from './Parent'
import { BaseSelectComponentProps } from '#typings'
import { findIndex } from 'lodash'

export type BaseSelectProps = BaseSelectComponentProps

const BaseSelect: ForwardRefRenderFunction<any, BaseSelectProps> = (
  props,
  ref
) => {
  const {
    options = [],
    children,
    placeholder = { label: 'Select an option', value: '' },
    value = '',
    ...p
  } = props
  if (findIndex(options, placeholder) === -1) {
    options.unshift(placeholder)
  } else {
    options[0] = placeholder
  }
  const Options = options.map((o, k) => {
    const { label, ...option } = o
    return (
      <option key={k} {...option}>
        {label}
      </option>
    )
  })
  const parentProps = {
    options,
    ref,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <select ref={ref} defaultValue={value} {...p}>
      {Options}
    </select>
  )
}

export default React.forwardRef(BaseSelect)
