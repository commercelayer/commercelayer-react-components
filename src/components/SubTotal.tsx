import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BaseOrderComponentProps, BOCProps } from './utils/BaseOrderPrice'

export type SubTotalProps = BaseOrderComponentProps

const SubTotal: FunctionComponent<SubTotalProps> = props => {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

SubTotal.propTypes = BOCProps

export default SubTotal
