import React, {
  ReactElement,
  FunctionComponent,
  useState,
  useContext
} from 'react'
import Parent from './utils/Parent'
import { initCLayer } from '@commercelayer/js-sdk'
import { OrderContainerProps } from './OrderContainer'
import CommerceLayerContext from './context/CommerceLayerContext'

export interface CommerceLayerProps {
  children: any
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
