import type { Component, ForwardedRef, JSX } from 'react';

export interface ParentProps {
  // Add parent ref to child
  parentRef?: ForwardedRef<any>
  children?: typeof Component | ((P: any) => JSX.Element | null)
}

export default function Parent({
  children,
  ...p
}: ParentProps): JSX.Element | null {
  const Child = children
  return Child !== undefined ? <Child {...p} /> : null
}
