import ExternalFunctionContext, {
  callExternalFunction,
} from '#context/ExternalFunctionContext'

type Props = {
  children: JSX.Element[] | JSX.Element
  url: string
}

export function ExternalFunction({ children, url }: Props): JSX.Element {
  return (
    <ExternalFunctionContext.Provider value={{ url, callExternalFunction }}>
      {children}
    </ExternalFunctionContext.Provider>
  )
}

export default ExternalFunction
