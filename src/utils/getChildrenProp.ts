import _ from 'lodash'
import { Children } from 'react'

export interface getChildrenPropInterface {
  (children: any, propName: string): string[]
}

const getChildrenProp: getChildrenPropInterface = (children, propName) => {
  return Children.map(children, child => {
    return child.props[propName]
  })
  // if (_.isArray(children)) {
  //   return children.map(child => child.props[propName])
  // } else {
  //   return children.props[propName] ? [children.props[propName]] : []
  // }
}

export default getChildrenProp
