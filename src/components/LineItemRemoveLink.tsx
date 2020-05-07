import React, { FunctionComponent, useContext, PropsWithoutRef } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import components from '../config/components'

const propTypes = components.LineItemRemoveLink.propTypes
const defaultProps = components.LineItemRemoveLink.defaultProps
const displayName = components.LineItemRemoveLink.displayName

type ChildrenLineItemRemoveLinkProps = {
  handleRemove: () => void
  label?: string
}

type LineItemRemoveLinkProps = {
  children?: (props: ChildrenLineItemRemoveLinkProps) => void
  label?: string
} & PropsWithoutRef<JSX.IntrinsicElements['a']>

const LineItemRemoveLink: FunctionComponent<LineItemRemoveLinkProps> = (
  props
) => {
  const { label = 'Remove' } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e): void => {
    e.preventDefault()
    deleteLineItem && deleteLineItem(lineItem['id'])
  }
  const parentProps = {
    handleRemove,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a {...props} href="#" onClick={handleRemove}>
      {label}
    </a>
  )
}

LineItemRemoveLink.propTypes = propTypes
LineItemRemoveLink.defaultProps = defaultProps
LineItemRemoveLink.displayName = displayName

export default LineItemRemoveLink
