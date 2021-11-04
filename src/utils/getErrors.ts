import { BaseError, ResourceErrorType } from '#typings/errors'

export default function getErrors(
  error: any,
  resource: ResourceErrorType
): BaseError[] {
  return error.errors.map((e: any) => {
    return { ...e, resource }
  })
}
