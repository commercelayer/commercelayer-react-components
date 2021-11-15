import { BaseError, ResourceErrorType } from '#typings/errors'
import differenceBy from 'lodash/differenceBy'
import { Dispatch } from 'react'

export default function getErrors(
  error: any,
  resource: ResourceErrorType
): BaseError[] {
  return error.errors.map((e: any) => {
    return { ...e, resource }
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
