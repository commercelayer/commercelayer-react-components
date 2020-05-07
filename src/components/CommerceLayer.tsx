import React, { FunctionComponent } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import components from '../config/components'

const propTypes = components.CommerceLayer.propTypes

export type CommerceLayerProps = {
  accessToken: string
  endpoint: string
  cache?: boolean
}

const CommerceLayer: FunctionComponent<CommerceLayerProps> = (props) => {
  const { children, ...p } = props
  const cache = !!p.cache
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
