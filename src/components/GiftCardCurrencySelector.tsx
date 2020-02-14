import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import BaseSelect, { OptionType } from './utils/BaseSelect'
import { BaseComponent } from '../@types/index'
import currencyOptions from '../utils/currency.json'

export interface GiftCardCurrencySelectorProps extends BaseComponent {
  children?: FunctionComponent
  placeholder?: OptionType
  value?: string
  required?: boolean
}

const GiftCardCurrencySelector: FunctionComponent<GiftCardCurrencySelectorProps> = props => {
  return <BaseSelect options={currencyOptions} name="currencyCode" {...props} />
}

GiftCardCurrencySelector.propTypes = {
  children: PropTypes.func,
  placeholder: PropTypes.exact({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string
  }),
  value: PropTypes.string
}

GiftCardCurrencySelector.defaultProps = {
  required: true
}

export default GiftCardCurrencySelector
