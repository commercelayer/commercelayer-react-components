import React, { FunctionComponent } from 'react'
import BaseSelect from './utils/BaseSelect'
import currencyOptions from '@config/currency.json'
import components from '@config/components'
import { BaseSelectComponentProps } from '@typings'

const propTypes = components.GiftCardCurrencySelector.propTypes
const defaultProps = components.GiftCardCurrencySelector.defaultProps
const displayName = components.GiftCardCurrencySelector.displayName

type GiftCardCurrencySelectorProps = Omit<
  BaseSelectComponentProps,
  'options' | 'name'
> & {
  required?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

const GiftCardCurrencySelector: FunctionComponent<GiftCardCurrencySelectorProps> = (
  props
) => {
  return <BaseSelect options={currencyOptions} name="currencyCode" {...props} />
}

GiftCardCurrencySelector.propTypes = propTypes
GiftCardCurrencySelector.defaultProps = defaultProps
GiftCardCurrencySelector.displayName = displayName

export default GiftCardCurrencySelector
