import type { JSX, ReactNode } from "react"
import ExternalFunctionContext, { callExternalFunction } from "#context/ExternalFunctionContext"

interface Props {
  children: ReactNode
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
