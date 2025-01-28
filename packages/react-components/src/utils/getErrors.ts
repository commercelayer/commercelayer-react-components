import type { TResourceError } from '#components/errors/Errors'
import type { BaseError, TAPIError } from '#typings/errors'
import type { ValueIteratee } from 'lodash'
import differenceBy from 'lodash/differenceBy'
import type { Dispatch } from 'react'

interface GetErrorsParams {
  error: TAPIError
  resource: TResourceError
  field?: string
  attributes?: Record<string, unknown>
}

export default function getErrors({
  error,
  resource,
  field,
  attributes
}: GetErrorsParams): BaseError[] {
  return error?.errors?.map((e: any) => {
    return {
      ...e,
      resource,
      ...(field != null && field !== '' && { field }),
      ...(attributes != null && attributes)
    }
  })
}

interface SetErrorsArgs<D> {
  currentErrors?: BaseError[]
  newErrors?: BaseError[]
  dispatch?: D
  filterBy?: ValueIteratee<BaseError>
}

export function setErrors<D extends Dispatch<any>>({
  currentErrors = [],
  newErrors = [],
  dispatch,
  filterBy = 'code'
}: SetErrorsArgs<D>): BaseError[] {
  const errorsDifference = differenceBy(currentErrors, newErrors, filterBy)
  const mergeErrors = currentErrors?.length === 0 ? newErrors : errorsDifference
  const errors = [...(currentErrors || []), ...mergeErrors]
  if (dispatch != null) {
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
  return errors
}
