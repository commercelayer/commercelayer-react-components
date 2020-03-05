import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import BaseSelect from './utils/BaseSelect'
import { BaseComponent } from '../@types/index'
import currencyOptions from '../utils/currency.json'

const GCCSProps = {
  children: PropTypes.func,
  placeholder: PropTypes.exact({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string
  }),
  value: PropTypes.string,
  required: PropTypes.bool
}

export type GiftCardCurrencySelectorProps = InferProps<typeof GCCSProps> &
  BaseComponent

const GiftCardCurrencySelector: FunctionComponent<GiftCardCurrencySelectorProps> = props => {
  return <BaseSelect options={currencyOptions} name="currencyCode" {...props} />
}

GiftCardCurrencySelector.propTypes = GCCSProps

GiftCardCurrencySelector.defaultProps = {
  required: true
}

export default GiftCardCurrencySelector
