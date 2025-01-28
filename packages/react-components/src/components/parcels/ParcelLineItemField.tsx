import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'
import ParcelLineItemChildrenContext from '#context/ParcelLineItemChildrenContext'

import type { JSX } from "react";

type ParcelLineItemFieldChildrenProps = TGenericChildrenProps<
  TResources['ParcelLineItem']
>

type TCondition = ConditionalElement<
  Exclude<TResources['ParcelLineItem'], 'resource'>
>

type Props = {
  children?: (props: ParcelLineItemFieldChildrenProps) => JSX.Element
} & TCondition
/**
 * @param props {@link Props}
 * @returns
 */
export function ParcelLineItemField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['ParcelLineItem']>
      resource='parcelLineItem'
      attribute={attribute}
      tagElement={tagElement}
      context={ParcelLineItemChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default ParcelLineItemField
