import React, { type ForwardRefRenderFunction, useState } from "react"
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

  // Normalise null/undefined → "" so the placeholder is always selected when
  // no external value has been set (the SDK returns null for unset fields).
  const safeValue = value ?? ""

  // Track the last external value we synced from so we can detect when the
  // parent intentionally changes it (e.g. pre-fill from loaded order, or reset).
  // Using derived-state pattern (during render) avoids the one-frame lag and
  // the stale-value issues that come with useEffect for controlled inputs.
  const [localValue, setLocalValue] = useState(safeValue)
  const [prevSafeValue, setPrevSafeValue] = useState(safeValue)

  if (safeValue !== prevSafeValue) {
    // Parent changed the value prop — sync immediately so this render already
    // shows the correct option. This does NOT fire when null/undefined oscillate
    // (both normalise to "") which preserves the user's own selection.
    setPrevSafeValue(safeValue)
    setLocalValue(safeValue)
  }

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
