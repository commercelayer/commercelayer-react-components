import React, { useContext, FunctionComponent, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.LineItemName.propTypes
const displayName = components.LineItemName.displayName

type LineItemNameChildrenProps = Omit<LineItemNameProps, 'children'> & {
  label: string
}

type LineItemNameProps = {
  children?: (props: LineItemNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['p']

const LineItemName: FunctionComponent<LineItemNameProps> = (props) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const label = lineItem['name']
  const parentProps = {
    label,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{label}</p>
  )
}

LineItemName.propTypes = propTypes
LineItemName.displayName = displayName

export default LineItemName
