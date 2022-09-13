import { useContext, PropsWithoutRef } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components-utils/Parent'

import { FunctionChildren } from '#typings/index'

type ChildrenProps = FunctionChildren<{
  handleRemove: (event: React.MouseEvent<HTMLAnchorElement>) => void
  label?: string
}>

type Props = {
  children?: ChildrenProps
  label?: string
} & PropsWithoutRef<JSX.IntrinsicElements['a']>

export function LineItemRemoveLink(props: Props) {
  const { label = 'Remove' } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    deleteLineItem && lineItem && deleteLineItem(lineItem['id'])
  }
  const parentProps = {
    handleRemove,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a {...props} href="#" onClick={handleRemove}>
      {label}
    </a>
  )
}

export default LineItemRemoveLink
