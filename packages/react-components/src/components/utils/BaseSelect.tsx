import React, { type ForwardRefRenderFunction, useEffect, useState } from "react"
import Parent from "./Parent"
import type { BaseSelectComponentProps } from "#typings"

export type BaseSelectProps = BaseSelectComponentProps

const BaseSelect: ForwardRefRenderFunction<any, BaseSelectProps> = (props, ref) => {
  const {
    options = [],
    children,
    placeholder = { label: "Select an option", value: "" },
    value = "",
    onChange,
    ...p
  } = props

  const [localValue, setLocalValue] = useState(value ?? "")

  // Keep the select in sync when the controlled value prop changes externally.
  // Normalise null → "" so the placeholder option is always selected when no
  // country/state has been chosen (null and undefined both mean "no selection").
  useEffect(() => {
    setLocalValue(value ?? "")
  }, [value])

  if (placeholder != null) {
    const isPlaceholderInOptions = options.some((option) => option.value === placeholder.value)
    if (!isPlaceholderInOptions) {
      options.unshift(placeholder)
    }
  }
  const Options = options.map((o, k) => {
    const { label, ...option } = o
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: options don't have stable ids
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalValue(e.target.value)
    onChange?.(e)
  }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <select ref={ref} value={localValue} onChange={handleChange} {...p}>
      {Options}
    </select>
  )
}

export default React.forwardRef(BaseSelect)
