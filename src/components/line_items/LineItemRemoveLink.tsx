import { useContext, PropsWithoutRef } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleRemove: (event: React.MouseEvent<HTMLAnchorElement>) => void
  label?: string
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
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    if (deleteLineItem != null && lineItem != null) deleteLineItem(lineItem.id)
    if (onClick != null) onClick(e)
  }
  const parentProps = {
    handleRemove,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a
      data-testid={`line-item-remove-link-${lineItem?.sku_code ?? ''}`}
      {...props}
      href='#'
      onClick={handleRemove}
    >
      {label}
    </a>
  )
}

export default LineItemRemoveLink
