import BaseField, { type BaseFieldProps } from '../utils/BaseField'

import type { JSX } from "react";

type Props = Omit<BaseFieldProps, 'attribute'>

export function OrderNumber(props: Props): JSX.Element {
  return <BaseField attribute='number' {...props} />
}

export default OrderNumber
