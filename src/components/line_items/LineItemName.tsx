import { useContext } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from '#components-utils/Parent'

import type { LineItem } from '@commercelayer/sdk'

export type LineItemNameType = Omit<Props, 'children'> & {
  label: string
  lineItem: LineItem
}

type Props = {
  children?: (props: LineItemNameType) => JSX.Element
} & JSX.IntrinsicElements['p']

export function LineItemName(props: Props) {
  const { lineItem } = useContext(LineItemChildrenContext)
  const label = lineItem?.['name']
  const parentProps = {
    label,
    lineItem,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{label}</p>
  )
}

export default LineItemName
