import BaseSelect from '#components-utils/BaseSelect'
import currencyOptions from '#config/currency'
import { BaseSelectComponentProps } from '#typings'

type Props = Omit<BaseSelectComponentProps, 'options' | 'name'> & {
  required?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

export function GiftCardCurrencySelector(props: Props): JSX.Element {
  return <BaseSelect options={currencyOptions} name="currencyCode" {...props} />
}

export default GiftCardCurrencySelector
