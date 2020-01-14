import _ from 'lodash'

export interface getChildrenPropInterface {
  (children: any, propName: string): string[]
}

const getChildrenProp: getChildrenPropInterface = (children, propName) => {
  if (_.isArray(children)) {
    return children.map(child => child.props[propName])
  } else {
    return [children.props[propName]]
  }
}

export default getChildrenProp
