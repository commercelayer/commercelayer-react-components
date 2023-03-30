import { type Context, useContext } from 'react'

interface TParams<C> {
  /**
   * Context to check
   */
  context: Context<C>
  /**
   * Name of the component has the context
   */
  contextComponentName: string
  /**
   * Name of the current component
   */
  currentComponentName: string
  /**
   * Key of the context to check
   */
  key: string
}

export default function useCustomContext<T>({
  context,
  key,
  currentComponentName,
  contextComponentName
}: TParams<T>): T {
  const currentContext = useContext<T>(context)
  const isProduction = process.env.NODE_ENV === 'production'
  const msg = `Cannot use <${currentComponentName}/> outside of <${contextComponentName}/>`
  // @ts-expect-error no type type is not assignable to currentContext
  if (key != null && key in currentContext) return currentContext
  if (key == null && currentContext != null) return currentContext
  if (isProduction) console.error(msg)
  else throw new Error(msg)
  return currentContext
}
