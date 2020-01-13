import React, { Fragment, cloneElement, ReactElement } from 'react'

export interface MultiParentInterface {
  children: ReactElement[]
}

export default function MultiParent({
  children,
  ...props
}: MultiParentInterface) {
  const cloned = children.map((child, k) => (
    <Fragment key={k}>
      {cloneElement(child, { ...props, ...child.props })}
    </Fragment>
  ))
  return <Fragment>{cloned}</Fragment>
}
