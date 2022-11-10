import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  TGenericChildrenProps,
  TResourceKey,
  TResources
} from '#components/utils/GenericFieldComponent'

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
  const { attribute, tagElement, children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['StockTransfer']>
      resource='stock_transfers'
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
