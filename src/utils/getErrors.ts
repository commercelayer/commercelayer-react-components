import { BaseError, ResourceErrorType } from '#typings/errors'
import differenceBy from 'lodash/differenceBy'
import { Dispatch } from 'react'

export default function getErrors(
  error: any,
  resource: ResourceErrorType,
  field?: string
): BaseError[] {
  return error?.errors?.map((e: any) => {
    return { ...e, resource, ...(field && { field }) }
  })
}

type SetErrorsArgs<D> = {
  currentErrors?: BaseError[]
  newErrors?: BaseError[]
  dispatch?: D
  filterBy?: string
}

export function setErrors<D extends Dispatch<any>>({
  currentErrors = [],
  newErrors = [],
  dispatch,
  filterBy = 'code',
}: SetErrorsArgs<D>): BaseError[] | void {
  const errorsDifference = differenceBy(currentErrors, newErrors, filterBy)
  const mergeErrors = currentErrors?.length === 0 ? newErrors : errorsDifference
  const errors = [...(currentErrors || []), ...mergeErrors]
  if (!dispatch) {
    return errors
  }
  dispatch({
    type: 'setErrors',
    payload: {
      errors,
    },
  })
}

type SetErrorsArgs<D> = {
  currentErrors?: BaseError[]
  newErrors?: BaseError[]
  dispatch: D
}

export function setErrors<D extends Dispatch<any>>({
  currentErrors = [],
  newErrors = [],
  dispatch,
}: SetErrorsArgs<D>) {
  const errorsDifference = differenceBy(currentErrors, newErrors, 'code')
  const mergeErrors = currentErrors?.length === 0 ? newErrors : errorsDifference
  dispatch({
    type: 'setErrors',
    payload: {
      errors: [...(currentErrors || []), ...mergeErrors],
    },
  })
}
