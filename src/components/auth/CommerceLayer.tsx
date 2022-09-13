import CommerceLayerContext from '#context/CommerceLayerContext'

type Props = {
  children: JSX.Element[] | JSX.Element
  accessToken: string
  endpoint: string
}

export function CommerceLayer(props: Props) {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={{ ...p }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

export default CommerceLayer
