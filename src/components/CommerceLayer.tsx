import React, { FunctionComponent } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import { InferProps } from 'prop-types'
import components from '../config/components'

const propTypes = components.CommerceLayer.props
export type CommerceLayerProps = InferProps<typeof propTypes>

const CommerceLayer: FunctionComponent<CommerceLayerProps> = props => {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={p}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = propTypes

export default CommerceLayer
