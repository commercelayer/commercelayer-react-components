import BaseSelect from '#components-utils/BaseSelect'
import currencyOptions from '#config/currency'
import components from '#config/components'
import { BaseSelectComponentProps } from '#typings'

const propTypes = components.GiftCardCurrencySelector.propTypes
const defaultProps = components.GiftCardCurrencySelector.defaultProps
const displayName = components.GiftCardCurrencySelector.displayName

type Props = Omit<BaseSelectComponentProps, 'options' | 'name'> & {
  required?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

export function GiftCardCurrencySelector(props: Props) {
  return <BaseSelect options={currencyOptions} name="currencyCode" {...props} />
}

GiftCardCurrencySelector.propTypes = propTypes
GiftCardCurrencySelector.defaultProps = defaultProps
GiftCardCurrencySelector.displayName = displayName

export default GiftCardCurrencySelector
