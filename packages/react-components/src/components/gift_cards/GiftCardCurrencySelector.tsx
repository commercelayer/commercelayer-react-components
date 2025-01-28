import BaseSelect from '#components/utils/BaseSelect'
import currencyOptions from '#config/currency'
import type { BaseSelectComponentProps } from '#typings'

import type { JSX } from "react";

type Props = Omit<BaseSelectComponentProps, 'options' | 'name'> & {
  required?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

export function GiftCardCurrencySelector(props: Props): JSX.Element {
  return <BaseSelect options={currencyOptions} name='currencyCode' {...props} />
}

export default GiftCardCurrencySelector
