import React, { FunctionComponent, useContext } from 'react'
import { BaseComponent } from '../@types/index'
import Parent from './utils/Parent'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import PropTypes, { InferProps } from 'prop-types'

const LIIProps = {
  width: PropTypes.number,
  src: PropTypes.string,
  children: PropTypes.func
}

export type LineItemImageProps = InferProps<typeof LIIProps> & BaseComponent

const LineItemImage: FunctionComponent<LineItemImageProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const src = props.src || lineItem.imageUrl
  const parenProps = {
    src,
    ...props
  }
  return props.children ? (
    <Parent {...parenProps}>{props.children}</Parent>
  ) : (
    <img src={src} {...props} />
  )
}

LineItemImage.propTypes = LIIProps

export default LineItemImage
