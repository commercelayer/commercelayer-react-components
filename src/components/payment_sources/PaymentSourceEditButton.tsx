import PaymentSourceContext from '#context/PaymentSourceContext'
import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings'

type CustomComponent = FunctionChildren<Omit<Props, 'children'>>

type Props = {
  children?: CustomComponent
  label?: string | JSX.Element
} & Omit<JSX.IntrinsicElements['button'], 'onClick'>
export function PaymentSourceEditButton({
  children,
  label = 'Edit',
  ...props
}: Props) {
  const { showCard, handleEditClick, readonly } =
    useContext(PaymentSourceContext)
  const parentProps = {
    showCard,
    label,
    handleEditClick,
    ...props,
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
