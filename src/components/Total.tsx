import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BaseOrderComponentProps, BOCProps } from './utils/BaseOrderPrice'

export type TotalProps = BaseOrderComponentProps

const Total: FunctionComponent<TotalProps> = props => {
  return <BaseOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

Total.propTypes = BOCProps

export default Total
