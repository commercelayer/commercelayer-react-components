import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'
import ParcelChildrenContext from '#context/ParcelChildrenContext'

import type { JSX } from "react";

type ParcelFieldChildrenProps = TGenericChildrenProps<TResources['Parcel']>

type TCondition = ConditionalElement<Exclude<TResources['Parcel'], 'resource'>>

type Props = {
  children?: (props: ParcelFieldChildrenProps) => JSX.Element
} & TCondition
/**
 * @param props {@link Props}
 * @returns
 */
export function ParcelField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['Parcel']>
      resource='parcel'
      attribute={attribute}
      tagElement={tagElement}
      context={ParcelChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default ParcelField
