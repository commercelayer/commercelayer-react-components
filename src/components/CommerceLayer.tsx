import React, { FunctionComponent } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import PropTypes, { InferProps } from 'prop-types'
// import OrderContainer from './OrderContainer'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import validationChildrenType from '../utils/validationChildrenType'

const CLProps = {
  children: validationChildrenType.isRequired,
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
