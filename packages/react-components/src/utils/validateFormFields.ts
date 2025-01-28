// TODO: Remove lodash
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import without from 'lodash/without'
import keys from 'lodash/keys'
import map from 'lodash/map'
import type { BaseState } from '#typings/index'
import type { BaseError } from '#typings/errors'
import { type AddressField, addressFields } from '#reducers/AddressReducer'
import type { AddressCreate } from '@commercelayer/sdk'
import type { AddressInputName } from '#typings'
import type { TResourceError } from '#components/errors/Errors'

const EMAIL_PATTERN =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

type FormField = HTMLInputElement | HTMLSelectElement

export type ValidateFormFields = <R extends string[]>(
  fields: HTMLFormControlsCollection,
  required: R,
  resourceType: TResourceError
) => {
  errors: BaseError[]
  values: BaseState
}

export type ValidateValue = <
  V extends string | boolean,
  N extends string,
  T extends string,
  B extends TResourceError
>(
  val: V,
  name: N,
  type: T,
  resource: B
) => BaseError | Record<string, any>

export const validateValue: ValidateValue = (val, name, type, resource) => {
  if (!val) {
    return {
      field: name,
      code: 'VALIDATION_ERROR',
      message: `${name} - is required`,
      resource
    }
  }
  if (type === 'email' && isString(val) && !val.match(EMAIL_PATTERN)) {
    return {
      field: name,
      code: 'VALIDATION_ERROR',
      message: `please enter a valid format`,
      resource
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
    const isTick = 'checked' in v
    const val = isTick || (v.value === 'on' ? false : v.value)
    const attrName = v.getAttribute('name')
    if ((attrName && required.includes(attrName)) || v.required) {
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
            metadata: { ...values.metadata, [`${v.name}`]: val }
          }
        : { ...values, [`${v.name}`]: val }
    }
  })
  return { errors, values }
}

export function fieldsExist(
  address: AddressCreate,
  schema: Array<AddressField | string> = addressFields
): boolean {
  if (!address.business) {
    const required = without(schema, 'line_2', 'company', 'state_code')
    const validAddress = keys(address).filter((k) => required.includes(k))
    return required.length > validAddress.length
  } else {
    const required = without(schema, 'first_name', 'last_name', 'line_2', 'state_code')
    const validAddress = keys(address).filter((k) => required.includes(k))
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
  'last_name'
]

const customerOptionalFields: CustomerOptionalField[] = [
  'billing_address_company',
  'shipping_address_company',
  'company'
]

export function businessMandatoryField(
  fieldName: AddressInputName,
  isBusiness?: boolean
): boolean {
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
