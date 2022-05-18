import { useContext, FunctionComponent, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import type { LineItem } from '@commercelayer/sdk'

const propTypes = components.LineItemName.propTypes
const displayName = components.LineItemName.displayName

export type LineItemNameType = Omit<LineItemNameProps, 'children'> & {
  label: string
  lineItem: LineItem
}

type LineItemNameProps = {
  children?: (props: LineItemNameType) => ReactNode
} & JSX.IntrinsicElements['p']

const LineItemName: FunctionComponent<LineItemNameProps> = (props) => {
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

LineItemName.propTypes = propTypes
LineItemName.displayName = displayName

export default LineItemName
