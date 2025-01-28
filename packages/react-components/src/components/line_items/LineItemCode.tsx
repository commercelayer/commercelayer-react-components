import { useContext, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from '#components/utils/Parent'
import type { LineItem } from '@commercelayer/sdk'
import type { ChildrenFunction } from '#typings/index'

export interface TLineItemCode extends Omit<Props, 'children'> {
  lineItem: LineItem
  skuCode: string
}

interface Props extends Omit<JSX.IntrinsicElements['p'], 'children'> {
  children?: ChildrenFunction<TLineItemCode>
  type?: 'sku_code' | 'bundle_code'
}

export function LineItemCode({
  type = 'sku_code',
  children,
  ...p
}: Props): JSX.Element {
  const { lineItem } = useContext(LineItemChildrenContext)
  const labelName = lineItem?.[type]
  const parentProps = {
    lineItem,
    skuCode: labelName,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{labelName}</p>
  )
}

export default LineItemCode
