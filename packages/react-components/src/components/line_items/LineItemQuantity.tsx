import { useContext, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings'

interface ChildrenProps extends Omit<Props, 'children'> {
  quantity: number
  handleChange: (event: React.MouseEvent<HTMLSelectElement>) => void
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  max?: number
  disabled?: boolean
  readonly?: boolean
} & (JSX.IntrinsicElements['select'] & JSX.IntrinsicElements['span'])

export function LineItemQuantity(props: Props): JSX.Element {
  const { max = 50, readonly = false, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { updateLineItem } = useContext(LineItemContext)
  const options: ReactNode[] = []
  for (let i = 1; i <= max; i++) {
    options.push(
      <option key={i} value={`${i}`}>
        {i}
      </option>
    )
  }
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const quantity = Number(e.target.value)
    updateLineItem && lineItem && updateLineItem(lineItem.id, quantity)
  }
  const quantity = lineItem?.quantity
  const parentProps = {
    handleChange,
    quantity,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : readonly ? (
    <span {...p}>{quantity}</span>
  ) : (
    <select
      title={lineItem?.name}
      value={quantity}
      onChange={handleChange}
      {...p}
    >
      {options}
    </select>
  )
}

export default LineItemQuantity
