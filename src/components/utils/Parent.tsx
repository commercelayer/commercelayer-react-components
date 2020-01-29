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

export default function Parent({ children, ...props }: ParentProps) {
  const Child = children
  console.log('props', props)
  // const childs = Children.map(children, (Child, k) => {
  //   console.log('Child', Child)
  //   debugger
  //   // if (typeof child.type === 'string') {
  //   //   console.error(
  //   //     `${child.type} component is not allowed. You can make a template with a function component.`
  //   //   )
  //   //   return null
  //   // }
  //   return (
  //     <Fragment key={k}>
  //       <Child {...props} />
  //     </Fragment>
  //   )
  // })
  return <Child {...props} />
}
