import { useContext, type ReactNode, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemContext from '#context/LineItemContext'
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings'
import type { LineItem } from '@commercelayer/sdk'

interface ChildrenProps extends Omit<Props, 'children'> {
  quantity: number
  handleChange: (event: React.MouseEvent<HTMLSelectElement>) => void
  lineItem?: LineItem
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  max?: number
  disabled?: boolean
  readonly?: boolean
  /**
   * force the update of the line item price using `_external_price: true` attribute
   * @link https://docs.commercelayer.io/core/external-resources/external-prices
   */
  hasExternalPrice?: boolean
} & (Omit<JSX.IntrinsicElements['select'], 'children'> &
  Omit<JSX.IntrinsicElements['span'], 'children'>)

export function LineItemQuantity(props: Props): JSX.Element {
  const { max = 50, readonly = false, hasExternalPrice, ...p } = props
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
    if (updateLineItem && lineItem) {
      updateLineItem(lineItem.id, quantity, hasExternalPrice)
    }
  }
  const quantity = lineItem?.quantity
  const parentProps = {
    handleChange,
    quantity,
    lineItem,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : readonly ? (
    <span {...p}>{quantity}</span>
  ) : (
    <select
      data-testid={lineItem?.sku_code}
      title={lineItem?.name ?? ''}
      value={quantity}
      onChange={handleChange}
      {...p}
    >
      {options}
    </select>
  )
}

export default LineItemQuantity
