import React, { ReactElement, FunctionComponent } from 'react'
import Parent from './utils/Parent'
import { initCLayer } from '@commercelayer/js-sdk'
import { OrderContainerProps } from './OrderContainer'

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
  return <Parent {...props}>{children}</Parent>
}

export default CommerceLayer
