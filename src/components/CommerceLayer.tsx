import React, { FunctionComponent, ReactNode } from 'react'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'

const propTypes = components.CommerceLayer.propTypes

type CommerceLayerProps = {
  children: ReactNode
  accessToken: string
  endpoint: string
  cache?: boolean
}

const CommerceLayer: FunctionComponent<CommerceLayerProps> = (props) => {
  const { children, cache = false, ...p } = props
  return (
    <CommerceLayerContext.Provider value={{ ...p, cache }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = propTypes
CommerceLayer.defaultProps = {
  cache: false,
}

export default CommerceLayer
