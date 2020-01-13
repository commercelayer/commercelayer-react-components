import React, {
  ReactNode,
  ReactHTMLElement,
  ReactNodeArray,
  ReactElement
} from 'react'
import Parent from './utils/Parent'
import { initCLayer } from '@commercelayer/js-sdk'

export interface CommerceLayerProps {
  children: ReactElement | ReactElement[]
  accessToken: string
  endpoint: string
}

export default function CommerceLayer({
  children,
  ...props
}: CommerceLayerProps) {
  const { accessToken, endpoint } = props
  if (accessToken && endpoint) {
    initCLayer({ accessToken, endpoint })
  }
  return <Parent {...props}>{children}</Parent>
}
