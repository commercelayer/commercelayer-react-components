import React, { Fragment, cloneElement, ReactElement, Children } from 'react'

export interface MultiParentInterface {
  children: ReactElement[]
}

export default function MultiParent({
  children,
  ...props
}: MultiParentInterface) {
  const cloned = Children.map(children, (child, k) => {
    return typeof child.type === 'string' ? (
      <Fragment key={k}>{cloneElement(child, { ...child.props })}</Fragment>
    ) : (
      <Fragment key={k}>
        {cloneElement(child, { ...props, ...child.props })}
      </Fragment>
    )
  })
  return <Fragment>{cloned}</Fragment>
}
