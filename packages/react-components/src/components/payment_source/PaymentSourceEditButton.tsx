import PaymentSourceContext from '#context/PaymentSourceContext'
import { type ReactNode, useContext, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings'

interface CustomComponent extends Omit<Props, 'children'> {}

type Props = {
  children?: ChildrenFunction<CustomComponent>
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements['button'], 'onClick'>
export function PaymentSourceEditButton({
  children,
  label = 'Edit',
  ...props
}: Props): JSX.Element | null {
  const { showCard, handleEditClick, readonly } =
    useContext(PaymentSourceContext)
  const parentProps = {
    showCard,
    label,
    handleEditClick,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : !readonly ? (
    <button {...props} onClick={handleEditClick as any}>
      {label}
    </button>
  ) : null
}

export default PaymentSourceEditButton
