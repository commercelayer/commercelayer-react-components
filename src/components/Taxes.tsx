import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.Taxes.propTypes
const defaultProps = components.Taxes.defaultProps
const displayName = components.Taxes.displayName

export type TaxAmountProps = PropsType<typeof propTypes>

const Taxes: FunctionComponent<TaxAmountProps> = (props) => {
  return <BaseOrderPrice base="amount" type="totalTax" {...props} />
}

Taxes.propTypes = propTypes
Taxes.defaultProps = defaultProps
Taxes.displayName = displayName

export default Taxes
