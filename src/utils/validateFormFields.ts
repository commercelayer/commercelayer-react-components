import _ from 'lodash'
import { BaseState } from '../@types/index'

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/

type FormField = HTMLInputElement | HTMLSelectElement

export interface ErrorsObj {
  [key: string]: {
    code: string
    title: string
  }
}

export interface ValidateFormFields {
  <R extends string[]>(fields: HTMLFormControlsCollection, required: R): {
    errors: ErrorsObj
    values: BaseState
  }
}

export interface ValidateValue {
  <V extends string, N extends string, T extends string>(
    val: V,
    name: N,
    type: T
  ): ErrorsObj
}

export const validateValue: ValidateValue = (val, name, type) => {
  if (!val) {
    return {
      [`${name}`]: {
        code: 'EMPTY_FIELD',
        title: 'Field is required'
      }
    }
  }
  if (type === 'email' && !val.match(EMAIL_PATTERN)) {
    return {
      [`${name}`]: {
        code: 'INVALID_FORMAT',
        title: 'Invalid format'
      }
    }
  }
}

const validateFormFields: ValidateFormFields = (fields, required) => {
  let errors = {}
  let values = {}
  _.map(fields, (v: FormField) => {
    if (required.indexOf(v.getAttribute('name')) !== -1 || v.required) {
      errors = { ...validateValue(v.value, v.name, v.type) }
      values = { ...values, [`${v.name}`]: v.value }
    }
    if (v.getAttribute('name')) {
      values = { ...values, [`${v.name}`]: v.value }
    }
  })
  return { errors, values }
}

export default validateFormFields
