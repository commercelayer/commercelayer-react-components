import React, { FunctionComponent, ReactNode } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import PropTypes from 'prop-types'

export interface CommerceLayerProps extends CommerceLayerConfig {
  children: ReactNode
  accessToken: string
  endpoint: string
}

const CommerceLayer: FunctionComponent<CommerceLayerProps> = props => {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={p}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = {
  children: PropTypes.node.isRequired,
  accessToken: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired
}

export default CommerceLayer
