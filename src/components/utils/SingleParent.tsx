import React, { Fragment, cloneElement, ReactElement } from 'react'

export interface SingleParentInterface {
  children: ReactElement
}

export default function SingleParent({ children, ...props }) {
  return typeof children.type === 'string' ? (
    children
  ) : (
    <Fragment>
      {cloneElement(children, { ...props, ...children.props })}
    </Fragment>
  )
}
