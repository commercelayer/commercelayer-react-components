import React, {
  Children,
  Fragment,
  ReactChild,
  cloneElement,
  ReactElement
} from 'react'
import _ from 'lodash'

export interface ParentProps {
  children: any
}

export default function Parent({ children, ...props }: ParentProps) {
  const childs = Children.map(children, (child, k) => {
    // if (typeof child.type === 'string') {
    //   console.error(
    //     `${child.type} component is not allowed. You can make a template with a function component.`
    //   )
    //   return null
    // }
    return (
      <Fragment key={k}>
        {cloneElement(child, { ...props, ...child.props })}
      </Fragment>
    )
  })
  return <Fragment>{childs}</Fragment>
}
