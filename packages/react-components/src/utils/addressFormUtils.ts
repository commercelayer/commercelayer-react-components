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
