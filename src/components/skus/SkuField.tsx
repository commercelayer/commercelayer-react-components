import SkuChildrenContext from '#context/SkuChildrenContext'
import { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  TGenericChildrenProps,
  TResourceKey,
  TResources,
} from '../utils/GenericFieldComponent'

type SkuFieldChildrenProps = TGenericChildrenProps<TResources['Sku']>

type TCondition = ConditionalElement<Exclude<TResources['Sku'], 'resource'>>

type Props = {
  children?: (props: SkuFieldChildrenProps) => JSX.Element
} & TCondition

export default function SkuField<P extends Props>(props: P) {
  const { attribute, tagElement, children, ...p } = props
  return (
    <GenericFieldComponent<TResourceKey['Sku']>
      resource="skus"
      attribute={attribute}
      tagElement={tagElement}
      context={SkuChildrenContext}
      {...p}
    >
      {children}
    </GenericFieldComponent>
  )
}
