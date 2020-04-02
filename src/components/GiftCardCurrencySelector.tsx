import React, { FunctionComponent } from 'react'
import { InferProps } from 'prop-types'
import BaseSelect from './utils/BaseSelect'
import currencyOptions from '../config/currency.json'
import components from '../config/components'

const propTypes = components.GiftCardCurrencySelector.props
const defaultProps = components.GiftCardCurrencySelector.defaultProps
const displayName = components.GiftCardCurrencySelector.displayName

export type GiftCardCurrencySelectorProps = InferProps<typeof propTypes>

const GiftCardCurrencySelector: FunctionComponent<GiftCardCurrencySelectorProps> = props => {
  return (
    <BaseSelect
      options={currencyOptions as any}
      name="currencyCode"
      {...props}
    />
  )
}

GiftCardCurrencySelector.propTypes = propTypes
GiftCardCurrencySelector.defaultProps = defaultProps
GiftCardCurrencySelector.displayName = displayName

export default GiftCardCurrencySelector
