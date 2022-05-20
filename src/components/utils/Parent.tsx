import { ForwardedRef, FunctionComponent } from 'react'

export type ParentProps = {
  parentRef?: ForwardedRef<any>
}

const Parent: FunctionComponent<ParentProps> = ({ children, ...p }) => {
  const Child = children as FunctionComponent<ParentProps>
  return Child ? <Child {...p} /> : null
}

export default Parent
