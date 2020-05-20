import { isValidElement, Children, ReactNode } from 'react'
import _ from 'lodash'
import { Requireable } from 'prop-types'
import components from '../config/components'

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
  if (_.isEmpty(children) && props['isRequired'])
    error = new Error(
      `The prop '${propName}' is marked as required in '${cpName}', but its value is '${children}'.`
    )
  Children.map(children, (c): any => {
    if (error) return error
    const type = c.type
    const itemTypes = components[cpName].permittedChildren
    const errorMsg = `Invalid prop '${propName}' supplied to ${cpName}. Only components ${itemTypes.join(
      ', '
    )} are allowed.`
    if (_.isFunction(type) && _.has(type, 'displayName')) {
      const displayName: string = type['displayName']
      const childComponentName = type.name
      if (displayName && displayName === `${childComponentName}`) {
        if (!itemTypes.includes(childComponentName)) {
          error = new Error(errorMsg)
        }
      }
    }
    if (!isValidElement(c)) {
      error = new Error(errorMsg)
    }
  })
  return error
}

const childrenTypes = checkChildrenTypes
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
export default childrenTypes as Requireable<ReactNode>
