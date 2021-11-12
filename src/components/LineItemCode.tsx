import React, { useContext, FunctionComponent, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.LineItemCode.propTypes
const displayName = components.LineItemCode.displayName

type LineItemNameChildrenProps = Omit<LineItemNameProps, 'children'>

type LineItemNameProps = {
  children?: (props: LineItemNameChildrenProps) => ReactNode
  type?: 'sku_code' | 'bundle_code'
} & JSX.IntrinsicElements['p']

const LineItemCode: FunctionComponent<LineItemNameProps> = ({
  type = 'sku_code',
  children,
  ...p
}) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const labelName = lineItem[type]
  const parentProps = {
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{labelName}</p>
  )
}

LineItemCode.propTypes = propTypes
LineItemCode.displayName = displayName

export default LineItemCode
