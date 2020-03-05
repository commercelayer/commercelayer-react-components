import React, { FunctionComponent } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import PropTypes, { InferProps } from 'prop-types'

const CLProps = {
  children: PropTypes.node.isRequired,
  accessToken: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired
}

export type CommerceLayerProps = InferProps<typeof CLProps> &
  CommerceLayerConfig

const CommerceLayer: FunctionComponent<CommerceLayerProps> = props => {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={p}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = CLProps

export default CommerceLayer
