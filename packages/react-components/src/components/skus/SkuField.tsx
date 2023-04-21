import SkuChildrenContext from '#context/SkuChildrenContext'
import { type ConditionalElement } from '#typings'
import GenericFieldComponent, {
  type TGenericChildrenProps,
  type TResourceKey,
  type TResources
} from '#components-utils/GenericFieldComponent'

type SkuFieldChildrenProps = TGenericChildrenProps<TResources['Sku']>

type TCondition = ConditionalElement<Exclude<TResources['Sku'], 'resource'>>

type Props = {
  children?: (props: SkuFieldChildrenProps) => JSX.Element
} & TCondition
/**
 * @param props {@link Props}
 * @returns
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
