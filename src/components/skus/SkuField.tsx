import SkuChildrenContext from '#context/SkuChildrenContext'
import { ConditionalElement } from '#typings'
import GenericFieldComponent, {
  TGenericChildrenProps,
  TResourceKey,
  TResources
} from '../utils/GenericFieldComponent'

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
  const { attribute, tagElement, children, ...p } = props
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
