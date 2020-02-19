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
  <V extends string | boolean, N extends string, T extends string>(
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
  if (type === 'email' && _.isString(val) && !val.match(EMAIL_PATTERN)) {
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
  let values = { metadata: {} }
  _.map(fields, (v: FormField) => {
    const isTick = !!v['checked']
    const val = isTick ? isTick : v.value
    if (required.indexOf(v.getAttribute('name')) !== -1 || v.required) {
      errors = { ...validateValue(val, v.name, v.type) }
      values = { ...values, [`${v.name}`]: val }
    }
    if (v.getAttribute('name')) {
      const isMetadata = !!v.getAttribute('data-metadata')
      values = isMetadata
        ? {
            ...values,
            metadata: { ...values.metadata, [`${v.name}`]: val }
          }
        : { ...values, [`${v.name}`]: val }
    }
  })
  return { errors, values }
}

export default validateFormFields
