import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import without from 'lodash/without'
import keys from 'lodash/keys'
import map from 'lodash/map'
import get from 'lodash/get'
import { BaseState } from '#typings/index'
import { ResourceErrorType, BaseError } from '#typings/errors'
import { AddressField, addressFields } from '#reducers/AddressReducer'
import { AddressCreate } from '@commercelayer/sdk'
import { AddressInputName } from '#typings'

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/

type FormField = HTMLInputElement | HTMLSelectElement

export interface ValidateFormFields {
  <R extends string[]>(
    fields: HTMLFormControlsCollection,
    required: R,
    resourceType: ResourceErrorType
  ): {
    errors: BaseError[]
    values: BaseState
  }
}

export interface ValidateValue {
  <
    V extends string | boolean,
    N extends string,
    T extends string,
    B extends ResourceErrorType
  >(
    val: V,
    name: N,
    type: T,
    resourceType: B
  ): BaseError | Record<string, any>
}

export const validateValue: ValidateValue = (val, name, type, resourceType) => {
  if (!val) {
    return {
      field: name,
      code: 'VALIDATION_ERROR',
      message: `${name} - is required`,
      resourceType,
    }
  }
  if (type === 'email' && isString(val) && !val.match(EMAIL_PATTERN)) {
    return {
      field: name,
      code: 'VALIDATION_ERROR',
      message: `${name} - is not valid`,
      resourceType,
    }
  }
  return {}
}

const validateFormFields: ValidateFormFields = (
  fields,
  required,
  resourceType
) => {
  const errors: BaseError[] = []
  let values = { metadata: {} }
  map(fields, (v: FormField) => {
    const isTick = !!get(v, 'checked')
    const val = isTick ? isTick : v.value === 'on' ? false : v.value
    const attrName = v.getAttribute('name')
    if ((attrName && required.indexOf(attrName) !== -1) || v.required) {
      const error = validateValue(val, v.name, v.type, resourceType)
      if (!isEmpty(error)) {
        errors.push(error as BaseError)
      }
      values = { ...values, [`${v.name}`]: val }
    }
    if (v.getAttribute('name')) {
      const isMetadata = !!v.getAttribute('data-metadata')
      values = isMetadata
        ? {
            ...values,
            metadata: { ...values.metadata, [`${v.name}`]: val },
          }
        : { ...values, [`${v.name}`]: val }
    }
  })
  return { errors, values }
}

export interface FieldsExist {
  (address: AddressCreate, schema?: AddressField[]): boolean
}

export const fieldsExist: FieldsExist = (address, schema = addressFields) => {
  // console.log('address', address)
  if (!address['business']) {
    const required = without(schema, 'line_2', 'company')
    const validAddress = keys(address).filter((k) =>
      required.includes(k as any)
    )
    return required.length > validAddress.length
  } else {
    const required = without(schema, 'first_name', 'last_name')
    const validAddress = keys(address).filter((k) =>
      required.includes(k as any)
    )
    return required.length > validAddress.length
  }
}

type CustomerOptionalField =
  | Extract<
      AddressInputName,
      | 'billing_address_line_2'
      | 'billing_address_company'
      | 'shipping_address_line_2'
      | 'shipping_address_company'
    >
  | 'company'
  | 'line_2'

type BusinessOptionalField =
  | Extract<
      AddressInputName,
      | 'billing_address_first_name'
      | 'billing_address_last_name'
      | 'shipping_address_first_name'
      | 'shipping_address_last_name'
    >
  | 'first_name'
  | 'last_name'

const businessOptionalFields: BusinessOptionalField[] = [
  'billing_address_first_name',
  'billing_address_last_name',
  'shipping_address_first_name',
  'shipping_address_last_name',
  'first_name',
  'last_name',
]

const customerOptionalFields: CustomerOptionalField[] = [
  'billing_address_company',
  'billing_address_line_2',
  'shipping_address_company',
  'shipping_address_line_2',
  'company',
  'line_2',
]

export function businessMandatoryField(
  fieldName: AddressInputName,
  isBusiness?: boolean
) {
  if (
    isBusiness &&
    businessOptionalFields.includes(fieldName as BusinessOptionalField)
  ) {
    return false
  }
  if (
    !isBusiness &&
    customerOptionalFields.includes(fieldName as CustomerOptionalField)
  ) {
    return false
  }
  return true
}

export default validateFormFields
