import { DefaultChildrenType } from '#typings/globals'

interface Props<T> {
  children: DefaultChildrenType
  filterBy: T[]
  componentName: string
}

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
    return children.filter((child) => filterBy.includes(child.type.displayName))
  }
  return children
}
