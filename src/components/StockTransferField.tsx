import React, { useContext, FunctionComponent, ReactNode } from 'react'
import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.StockTransferField.propTypes
const displayName = components.StockTransferField.displayName

type StockTransferFieldChildrenProps = Omit<StockTransferFieldProps, 'children'>

export type StockTransferFieldType = 'quantity' | 'skuCode'

type StockTransferFieldProps = {
  children?: (props: StockTransferFieldChildrenProps) => ReactNode
  type: StockTransferFieldType
} & JSX.IntrinsicElements['p']

const StockTransferField: FunctionComponent<StockTransferFieldProps> = (
  props
) => {
  const { type } = props
  const { stockTransfer } = useContext(StockTransferChildrenContext)
  const text = stockTransfer ? stockTransfer[type] : ''
  const parentProps = {
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{text}</p>
  )
}

StockTransferField.propTypes = propTypes
StockTransferField.displayName = displayName

export default StockTransferField
