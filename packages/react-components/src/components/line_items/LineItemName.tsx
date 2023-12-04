import { useContext } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from '#components/utils/Parent'
import type { LineItem } from '@commercelayer/sdk'
import { type ChildrenFunction } from '#typings/index'
import LineItemBundleChildrenContext from '#context/LineItemBundleChildrenContext'

export interface TLineItemName extends Omit<Props, 'children'> {
  label: string
  lineItem: LineItem
}

interface Props extends Omit<JSX.IntrinsicElements['p'], 'children'> {
  children?: ChildrenFunction<TLineItemName>
}

export function LineItemName(props: Props): JSX.Element {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { lineItem: listItemBundle } = useContext(LineItemBundleChildrenContext)
  const item = lineItem ?? listItemBundle
  const label = item?.name
  const parentProps = {
    label,
    lineItem: item,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p data-testid={`line-item-name-${item?.sku_code ?? ''}`} {...props}>
      {label}
    </p>
  )
}

export default LineItemName
