import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'
import CustomerContext from '#context/CustomerContext'

import type { JSX } from "react";

type StockTransferFieldChildrenProps = TGenericChildrenProps<
  TResources['Customer']
>

type TCondition = ConditionalElement<
  Exclude<TResources['Customer'], 'resource'>
>

type Props = {
  children?: (props: StockTransferFieldChildrenProps) => JSX.Element
} & TCondition

/**
 * The CustomerField component displays any attribute of the `customer` set in the state of the parent `<CustomerContainer>` component.
 *
 * It also accepts a `tagElement` props to enable specific tag-related props.
 * For examples, when `tagElement` is set to `img` it will also accept props related to `<img>` tag such as `height` and `width`.
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside the `<CustomerContainer>` component.
 * </span>
 *
 * <span title="Fields" type="info">
 * Check the `customers` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/customers/object)
 * for more details about the available attributes to render.
 * </span>
 */
export function CustomerField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['Customer']>
      resource='customers'
      attribute={attribute}
      tagElement={tagElement}
      context={CustomerContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default CustomerField
