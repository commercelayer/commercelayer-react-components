import React, {
  type ForwardRefRenderFunction,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react"
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

  // Keep an internal ref to the DOM select so we can imperatively sync it
  // when the external value changes (e.g., order loads with a pre-filled address).
  const internalRef = useRef<HTMLSelectElement>(null)

  // Track the last external value we pushed to the DOM.
  const prevSafeValueRef = useRef(safeValue)

  // Combine the forwarded ref with our internal ref so callers can still hold
  // a ref to the underlying <select> element while we also manage it.
  const combinedRef = useCallback(
    (node: HTMLSelectElement | null) => {
      internalRef.current = node
      if (ref == null) return
      if (typeof ref === "function") {
        ref(node)
      } else {
        ref.current = node
      }
    },
    [ref]
  )

  // When the parent changes the value prop (e.g. order pre-fill arrives),
  // update the uncontrolled DOM select directly before the browser paints.
  // We intentionally leave the DOM alone when safeValue stays the same so
  // user-driven changes (picking a different country) are never overridden.
  useLayoutEffect(() => {
    if (safeValue !== prevSafeValueRef.current && internalRef.current != null) {
      prevSafeValueRef.current = safeValue
      internalRef.current.value = safeValue
    }
  }, [safeValue])

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
    onChange?.(e)
  }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    // Uncontrolled: defaultValue sets the initial selection; user changes and
    // programmatic updates via useLayoutEffect above drive the DOM value.
    <select ref={combinedRef} defaultValue={safeValue} onChange={handleChange} {...p}>
      {Options}
    </select>
  )
}

export default React.forwardRef(BaseSelect)
