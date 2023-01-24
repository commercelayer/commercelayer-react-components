import { TResourceError } from '#components/errors/Errors'
import { BaseError } from '#typings/errors'
import differenceBy from 'lodash/differenceBy'
import { Dispatch } from 'react'

export default function getErrors(
  error: any,
  resource: TResourceError,
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
