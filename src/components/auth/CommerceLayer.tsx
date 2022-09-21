import CommerceLayerContext from '#context/CommerceLayerContext'
import ErrorBoundary from '#components/utils/ErrorBoundary'

type Props = {
  children: JSX.Element[] | JSX.Element
  accessToken: string
  endpoint: string
}

export function CommerceLayer(props: Props) {
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
