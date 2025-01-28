import LineItemChildrenContext from '#context/LineItemChildrenContext'
import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'

import type { JSX } from "react";

type LineItemFieldChildrenProps = TGenericChildrenProps<TResources['LineItem']>

type TCondition = ConditionalElement<
  Exclude<TResources['LineItem'], 'resource'>
>

type Props = {
  children?: (props: LineItemFieldChildrenProps) => JSX.Element
} & TCondition
/**
 * @param props {@link Props}
 * @returns
 */
export function LineItemField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['LineItem']>
      resource='lineItem'
      attribute={attribute}
      tagElement={tagElement}
      context={LineItemChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default LineItemField
