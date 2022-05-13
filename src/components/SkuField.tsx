import SkuChildrenContext from '#context/SkuChildrenContext'
import { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  TResourceKey,
  TResources,
} from './utils/GenericFieldComponent'

type SkuFieldChildrenProps = Omit<Props, 'children' | 'attribute' | 'element'>

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
