import { useContext, type PropsWithoutRef, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { LineItem } from '@commercelayer/sdk'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleRemove: (event: React.MouseEvent<HTMLAnchorElement>) => void
  label?: string
  lineItem?: LineItem
}

interface Props
  extends PropsWithoutRef<Omit<JSX.IntrinsicElements['button'], 'children'>> {
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
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    if (deleteLineItem != null && lineItem != null)
      deleteLineItem(lineItem.id)
    if (onClick != null) onClick(e)
  }
  const parentProps = {
    handleRemove,
    lineItem,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <button
      data-testid={`line-item-remove-link-${lineItem?.sku_code ?? ''}`}
      {...props}
      type='button'
      onClick={handleRemove}
    >
      {label}
    </button>
  )
}

export default LineItemRemoveLink
