import { useContext, type PropsWithoutRef } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components/utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import { type LineItem } from '@commercelayer/sdk'
import LineItemBundleChildrenContext from '#context/LineItemBundleChildrenContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleRemove: (event: React.MouseEvent<HTMLAnchorElement>) => void
  label?: string
  lineItem?: LineItem
}

interface Props
  extends PropsWithoutRef<Omit<JSX.IntrinsicElements['a'], 'children'>> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string
}

export function LineItemRemoveLink(props: Props): JSX.Element {
  const { label = 'Remove', onClick } = props
  const { lineItem } = useCustomContext({
    context: LineItemChildrenContext,
    contextComponentName: 'LineItem',
    currentComponentName: 'LineItemRemoveLink',
    key: 'lineItem'
  })
  const { lineItem: lineItemBundle } = useContext(LineItemBundleChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const item = lineItem ?? lineItemBundle
  const lineItemId = item?.id
  const handleRemove = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    if (deleteLineItem != null && lineItemId != null)
      void deleteLineItem(lineItemId)
    if (onClick != null) onClick(e)
  }
  const parentProps = {
    handleRemove,
    lineItem: item,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a
      data-testid={`line-item-remove-link-${item?.sku_code ?? ''}`}
      {...props}
      href='#'
      onClick={handleRemove}
    >
      {label}
    </a>
  )
}

export default LineItemRemoveLink
