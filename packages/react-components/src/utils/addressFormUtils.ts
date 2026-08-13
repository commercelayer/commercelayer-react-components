import type { Value } from "rapid-form"

export type FormErrors = Record<
  string,
  {
    code: string
    message: string
    error: boolean
  }
>

export type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export type FormValue = Value & {
  checked?: boolean
  name?: string
  required?: boolean
  type?: string
  value?: string | number | readonly string[]
}

/**
 * rapid-form v5 widened a tracked field's `value` to `string | string[]` so it can
 * carry multi-value controls (checkbox groups, `<select multiple>`). Address fields
 * are all single-valued, so collapse the union back to a string — taking the first
 * entry if an array ever arrives.
 */
export function singleFormValue(value: string | string[] | undefined | null): string | undefined {
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

export function getFormElement(form: HTMLFormElement | null, name: string): FormElement | null {
  const element = form?.elements.namedItem(name)
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element
  }
  return null
}
