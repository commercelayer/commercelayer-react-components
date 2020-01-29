import React, {
  Children,
  Fragment,
  ReactChild,
  cloneElement,
  ReactElement,
  HTMLProps,
  FunctionComponent
} from 'react'
import _ from 'lodash'

export interface ParentProps {
  children: FunctionComponent
}

const Parent: FunctionComponent<ParentProps> = props => {
  const Child = props.children
  return <Child {...props} />
}
export default Parent
