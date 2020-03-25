import { isValidElement, Children, Requireable, Validator } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

export interface CheckChildrenType {
  (
    isRequired: boolean,
    props: { [key: string]: any },
    propName: string,
    componentName: string
  ): Error | null
}

const checkChildrenType: CheckChildrenType = (
  isRequired,
  props,
  propName,
  componentName
) => {
  const c = PropTypes.string
  debugger
  let error = null
  const children = props[propName]
  if (_.isEmpty(children) && isRequired)
    return new Error(
      `The prop '${propName}' is marked as required in '${componentName}, but its value is '${children}'`
    )
  const errorMsg = `Invalid prop '${propName}' supplied to ${componentName}. Only components ${types.join(
    ', '
  )} are allowed.`
  Children.map(children, c => {
    if (error) return null
    const type = c.type
    if (_.isFunction(type)) {
      const childComponentName = type.name
      // TODO config file to map the children
      // if (!types.includes(childComponentName)) {
      //   error = new Error(errorMsg)
      // }
    }
    if (!isValidElement(c)) {
      error = new Error(errorMsg)
    }
  })
  return error
}
const validationChildrenType = checkChildrenType.bind(null, false)
validationChildrenType.isRequired = checkChildrenType.bind(null, true)

export default validationChildrenType as Requireable<any>
