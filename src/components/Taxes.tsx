import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BaseOrderComponentProps, BOCProps } from './utils/BaseOrderPrice'

export type TaxAmountProps = BaseOrderComponentProps

const Taxes: FunctionComponent<TaxAmountProps> = props => {
  return <BaseOrderPrice base="amount" type="totalTax" {...props} />
}

Taxes.propTypes = BOCProps

export default Taxes
