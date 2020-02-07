import React, { FunctionComponent, ReactNode, useState, useEffect } from 'react'
// import { initCLayer } from '@commercelayer/js-sdk'
import CommerceLayerContext from '../context/CommerceLayerContext'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'

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

export default CommerceLayer
