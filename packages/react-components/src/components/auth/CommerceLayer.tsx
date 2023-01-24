import CommerceLayerContext from '#context/CommerceLayerContext'
import ErrorBoundary from '#components/utils/ErrorBoundary'
import type { DefaultChildrenType } from '#typings/globals'

interface Props {
  children: DefaultChildrenType
  accessToken: string
  endpoint: string
}

export function CommerceLayer(props: Props): JSX.Element {
  const { children, ...p } = props
  return (
    <ErrorBoundary>
      <CommerceLayerContext.Provider value={{ ...p }}>
        {children}
      </CommerceLayerContext.Provider>
    </ErrorBoundary>
  )
}

export default CommerceLayer
