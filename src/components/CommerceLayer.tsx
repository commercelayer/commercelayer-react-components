import React, { FunctionComponent, ReactNode } from 'react'
import { initCLayer } from '@commercelayer/js-sdk'
import CommerceLayerContext from './context/CommerceLayerContext'

export interface CommerceLayerProps {
  children: ReactNode
  accessToken: string
  endpoint: string
}

const CommerceLayer: FunctionComponent<CommerceLayerProps> = ({
  children,
  ...props
}) => {
  const { accessToken, endpoint } = props
  if (accessToken && endpoint) {
    initCLayer({ accessToken, endpoint })
  }
  return (
    <CommerceLayerContext.Provider value={{ accessToken, endpoint }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

export default CommerceLayer
