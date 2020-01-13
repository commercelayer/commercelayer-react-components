import _ from 'lodash'

export default function getChildrenProp(children, propName) {
  if (_.isArray(children)) {
    return children.map(child => child.props[propName])
  } else {
    return children.props[propName]
  }
}
