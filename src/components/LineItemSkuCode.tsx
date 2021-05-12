import React, { useContext, FunctionComponent, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.LineItemSkuCode.propTypes
const displayName = components.LineItemSkuCode.displayName

type LineItemNameChildrenProps = Omit<LineItemNameProps, 'children'>

type LineItemNameProps = {
  children?: (props: LineItemNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['p']

const LineItemSkuCode: FunctionComponent<LineItemNameProps> = (props) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const labelName = lineItem['skuCode']
  const parentProps = {
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{labelName}</p>
  )
}

LineItemSkuCode.propTypes = propTypes
LineItemSkuCode.displayName = displayName

export default LineItemSkuCode
