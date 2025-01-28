import type { DefaultChildrenType } from '#typings/globals'

import type { JSX } from "react";

interface Props<T> {
  children: DefaultChildrenType
  filterBy: T[]
  componentName: string
}

/**
 * Filter children by component display name
 */
export default function filterChildren<T = string>({
  children,
  filterBy,
  componentName
}: Props<T>): JSX.Element | JSX.Element[] | null {
  const wrongComponents = Array.isArray(children)
    ? children.filter((child) => typeof child.type === 'string').length > 0
    : typeof children?.type === 'string'
  if (wrongComponents) {
    throw new Error(
      `Only library components are allowed into <${componentName}/>`
    )
  }
  if (Array.isArray(children)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return children.filter((child) => filterBy.includes(child.type.displayName))
  }
  return children
}
