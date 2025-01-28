import Parent from '#components/utils/Parent'
import CustomerContext from '#context/CustomerContext'
import type { ChildrenFunction } from '#typings/index'
import { useContext, type JSX } from 'react';

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  /**
   * Function allow you to customize the component
   */
  children?: ChildrenFunction<Omit<Props, 'children'>>
  /**
   * Label to show. Default: 'No addresses available.'
   */
  emptyText?: string
}

/**
 * The AddressesEmpty component is aimed to display a message in case no customer address is available, otherwise it won't show.
 *
 * It accepts an optional `emptyText` prop to customize default message.
 *
 * It is also possible to wrap inside this component any children elements to create a completely custom experience regarding the absence of customer addresses.
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside the `<AddressesContainer>` component.
 * </span>
 *
 */
export function AddressesEmpty(props: Props): JSX.Element | null {
  const { children, emptyText = 'No addresses available.', ...p } = props
  const { addresses } = useContext(CustomerContext)
  const parentProps = { emptyText, ...p }
  if (addresses == null || addresses.length > 0) {
    return null
  }
  return children !== undefined ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span data-testid='addresses-empty' {...p}>
      {emptyText}
    </span>
  )
}

export default AddressesEmpty
