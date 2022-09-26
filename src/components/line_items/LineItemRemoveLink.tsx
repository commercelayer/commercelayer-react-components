import { useContext, PropsWithoutRef } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings/index'

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
  const { label = 'Remove' } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    deleteLineItem && lineItem && deleteLineItem(lineItem.id)
  }
  const parentProps = {
    handleRemove,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a {...props} href='#' onClick={handleRemove}>
      {label}
    </a>
  )
}

export default LineItemRemoveLink
