import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import type { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'

import type { JSX } from "react";

type StockTransferFieldChildrenProps = TGenericChildrenProps<
  TResources['StockTransfer']
>

type TCondition = ConditionalElement<
  Exclude<TResources['StockTransfer'], 'resource'>
>

type Props = {
  children?: (props: StockTransferFieldChildrenProps) => JSX.Element
} & TCondition

export function StockTransferField<P extends Props>(props: P): JSX.Element {
  const { attribute, tagElement = 'span', children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['StockTransfer']>
      resource='stockTransfer'
      attribute={attribute}
      tagElement={tagElement}
      context={StockTransferChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}

export default StockTransferField
