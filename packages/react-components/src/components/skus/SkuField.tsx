import SkuChildrenContext from '#context/SkuChildrenContext'
import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components-utils/GenericFieldComponent'

import type { JSX } from "react";

type SkuFieldChildrenProps = TGenericChildrenProps<TResources['Sku']>

type TCondition = ConditionalElement<Exclude<TResources['Sku'], 'resource'>>

type Props = {
  children?: (props: SkuFieldChildrenProps) => JSX.Element
} & TCondition

/**
 * The SkuField component displays any attribute of the `sku` specified in the parent `<SkusContainer>` component.
 *
 * It also accepts a `tagElement` props to enable specific tag-related props.
 * For examples, when `tagElement` is set to `img` it will also accept props related to `<img>` tag such as `height` and `width`.
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside the `<SkusContainer>` component.
 * </span>
 *
 * <span title="Fields" type="info">
 * Check the `skus` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/skus/object)
 * for more details about the available attributes to render.
 * </span>
 */
export function SkuField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['Sku']>
      resource='sku'
      attribute={attribute}
      tagElement={tagElement}
      context={SkuChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default SkuField
