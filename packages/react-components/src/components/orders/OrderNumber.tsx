import BaseField, { BaseFieldProps } from '../utils/BaseField'

type Props = Omit<BaseFieldProps, 'attribute'>

export function OrderNumber(props: Props): JSX.Element {
  return <BaseField attribute='number' {...props} />
}

export default OrderNumber
