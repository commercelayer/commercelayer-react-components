import { useContext, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from '#components/utils/Parent'
import type { LineItem } from '@commercelayer/sdk'
import type { ChildrenFunction } from '#typings/index'

export interface TLineItemName extends Omit<Props, 'children'> {
  label: string
  lineItem: LineItem
}

interface Props extends Omit<JSX.IntrinsicElements['p'], 'children'> {
  children?: ChildrenFunction<TLineItemName>
}

export function LineItemName(props: Props): JSX.Element {
  const { lineItem } = useContext(LineItemChildrenContext)
  const label = lineItem?.name
  const parentProps = {
    label,
    lineItem,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p data-testid={`line-item-name-${lineItem?.sku_code ?? ''}`} {...props}>
      {label}
    </p>
  )
}

export default LineItemName
