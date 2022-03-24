import { isValidElement, Children, ReactNode } from 'react'
import { isEmpty, isFunction, has, get } from 'lodash'
import { Requireable } from 'prop-types'
import components from '#config/components'

export interface CheckChildrenTypes {
  (
    props: { [key: string]: any },
    propName: string,
    componentName: string,
    location: string,
    propFullName: string
  ): Error | null
}

const checkChildrenTypes: CheckChildrenTypes = (
  props,
  propName,
  componentName
) => {
  let error: Error | null = null
  const children = props[propName]
  const cpName = componentName.replace('CL', '')
  if (
    ((isEmpty(children) && typeof children !== 'function') ||
      (typeof children === 'function' && !children)) &&
    props['isRequired']
  ) {
    error = new Error(
      `The prop '${propName}' is marked as required in '${cpName}', but its value is '${children}'.`
    )
  }
  Children.map(children, (c): any => {
    if (error) return error
    const type = c?.type
    const itemTypes = get(components, `${cpName}.permittedChildren`)
    const errorMsg = `Invalid prop '${propName}' supplied to ${cpName}. Only components ${itemTypes.join(
      ', '
    )} are allowed.`
    if (isFunction(type) && has(type, 'displayName')) {
      const displayName: string = get(type, 'displayName')
      const childComponentName = type.name
      if (displayName && displayName === `${childComponentName}`) {
        if (!itemTypes.includes(childComponentName)) {
          error = new Error(errorMsg)
        }
      }
    }
    if (!isValidElement(c) && c !== null) {
      error = new Error(errorMsg)
    }
  })
  return error
}

const childrenTypes: any = checkChildrenTypes
childrenTypes['isRequired'] = (
  props: { [key: string]: any },
  propName: string,
  componentName: string,
  location: string,
  propFullName: string
): Error | null | Element[] =>
  checkChildrenTypes(
    { ...props, isRequired: true },
    propName,
    componentName,
    location,
    propFullName
  )

// NOTE change in the future (now is general for typescript)
export default childrenTypes as Requireable<ReactNode | (() => ReactNode)>
