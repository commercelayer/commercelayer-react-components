import React, { Fragment, cloneElement, ReactElement } from 'react'

export interface SingleParentInterface {
  children: ReactElement
}

export default function SingleParent({ children, ...props }) {
  return (
    <Fragment>
      {cloneElement(children, { ...props, ...children.props })}
    </Fragment>
  )
}
