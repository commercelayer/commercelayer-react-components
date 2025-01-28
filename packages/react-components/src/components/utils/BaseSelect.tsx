import React, { type ForwardRefRenderFunction } from 'react'
import Parent from './Parent'
import type { BaseSelectComponentProps } from '#typings'

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
  if (placeholder != null) {
    const isPlaceholderInOptions = options.some((option) => option.value === placeholder.value)
    if (!isPlaceholderInOptions) {
      options.unshift(placeholder)
    }
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
    ...p
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
