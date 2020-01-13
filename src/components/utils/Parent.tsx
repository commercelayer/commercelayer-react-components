import React from 'react'
import _ from 'lodash'
import MultiParent from './MultiParent'
import SingleParent from './SingleParent'

export interface ParentProps {
  children: any
}

export default function Parent({ children, ...props }: ParentProps) {
  return _.isArray(children) ? (
    <MultiParent {...props}>{children}</MultiParent>
  ) : (
    <SingleParent {...props}>{children}</SingleParent>
  )
}
