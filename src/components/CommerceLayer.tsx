import React, { FunctionComponent } from 'react'
import CommerceLayerContext from '../context/CommerceLayerContext'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.CommerceLayer.propTypes
const defaultProps = components.CommerceLayer.defaultProps
export type CommerceLayerProps = PropsType<typeof propTypes>

const CommerceLayer: FunctionComponent<CommerceLayerProps> = (props) => {
  const { children, ...p } = props
  const cache = p.cache || false
  return (
    <CommerceLayerContext.Provider value={{ ...p, cache }}>
      {children}
    </CommerceLayerContext.Provider>
  )
}

CommerceLayer.propTypes = propTypes
CommerceLayer.defaultProps = defaultProps

export default CommerceLayer
