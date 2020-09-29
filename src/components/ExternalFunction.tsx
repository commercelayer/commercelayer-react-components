import ExternalFunctionContext, {
  callExternalFunction,
} from '../context/ExternalFunctionContext'
import React, { FunctionComponent, ReactNode } from 'react'
import components from '../config/components'

const propTypes = components.ExternalFunction.propTypes
const displayName = components.ExternalFunction.displayName

type Props = {
  children: ReactNode
  url: string
}

const ExternalFunction: FunctionComponent<Props> = ({ children, url }) => {
  return (
    <ExternalFunctionContext.Provider value={{ url, callExternalFunction }}>
      {children}
    </ExternalFunctionContext.Provider>
  )
}

ExternalFunction.propTypes = propTypes
ExternalFunction.displayName = displayName

export default ExternalFunction
