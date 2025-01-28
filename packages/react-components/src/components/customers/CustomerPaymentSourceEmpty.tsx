import Parent from '#components/utils/Parent'
import CustomerContext from '#context/CustomerContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'

import type { JSX } from "react";

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  /**
   * Function allow you to customize the component
   */
  children?: ChildrenFunction<Omit<Props, 'children'>>
  /**
   * Label to show. Default: 'No payments available.'
   */
  emptyText?: string
}

export function CustomerPaymentSourceEmpty({
  children,
  emptyText = 'No payments available',
  ...p
}: Props): JSX.Element | null {
  const { payments } = useCustomContext({
    context: CustomerContext,
    contextComponentName: 'CustomerContainer',
    currentComponentName: 'CustomerPaymentSourceEmpty',
    key: 'payments'
  })
  const parentProps = { emptyText, ...p }
  if (payments != null && payments.length > 0) {
    return null
  }
  if (payments === null) {
    return null
  }
  return children !== undefined ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{emptyText}</span>
  )
}

export default CustomerPaymentSourceEmpty
