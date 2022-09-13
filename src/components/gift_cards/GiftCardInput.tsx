import BaseInput from '#components-utils/BaseInput'

import { BaseInputComponentProps, GiftCardInputName } from '#typings'

type Props = {
  name: GiftCardInputName
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function GiftCardInput(props: Props) {
  const { placeholder = '', ...p } = props
  return <BaseInput placeholder={placeholder} {...p} />
}

export default GiftCardInput
