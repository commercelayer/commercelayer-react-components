import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  TResourceKey,
  TResources,
} from './utils/GenericFieldComponent'

type StockTransferFieldChildrenProps = Omit<
  Props,
  'children' | 'attribute' | 'element'
>

type TCondition = ConditionalElement<
  Exclude<TResources['StockTransfer'], 'resource'>
>

type Props = {
  children?: (props: StockTransferFieldChildrenProps) => JSX.Element
} & TCondition

export default function StockTransferField<P extends Props>(props: P) {
  const { attribute, tagElement, children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['StockTransfer']>
      resource="stock_transfers"
      attribute={attribute}
      tagElement={tagElement}
      context={StockTransferChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}
