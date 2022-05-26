import { ReactNode } from 'react'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'

const propTypes = components.CommerceLayer.propTypes

type Props = {
  children: ReactNode
  accessToken: string
  endpoint: string
}

export default function CommerceLayer(props: Props) {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={{ ...p }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = propTypes
