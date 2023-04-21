import { type ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components/utils/GenericFieldComponent'
import CustomerContext from '#context/CustomerContext'

type StockTransferFieldChildrenProps = TGenericChildrenProps<
  TResources['Customer']
>

type TCondition = ConditionalElement<
  Exclude<TResources['Customer'], 'resource'>
>

type Props = {
  children?: (props: StockTransferFieldChildrenProps) => JSX.Element
} & TCondition

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
