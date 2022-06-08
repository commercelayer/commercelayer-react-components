import { FunctionComponent, ReactNode } from 'react'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'

const propTypes = components.CommerceLayer.propTypes

type CommerceLayerProps = {
  children: ReactNode
  accessToken: string
  endpoint: string
}

const CommerceLayer: FunctionComponent<CommerceLayerProps> = (props) => {
  const { children, ...p } = props
  return (
    <CommerceLayerContext.Provider value={{ ...p }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = propTypes

export default CommerceLayer
