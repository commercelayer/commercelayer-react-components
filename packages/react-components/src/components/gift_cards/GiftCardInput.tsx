import BaseInput from '#components/utils/BaseInput'
import { type BaseInputComponentProps, type GiftCardInputName } from '#typings'

type Props = {
  name: GiftCardInputName
} & Omit<BaseInputComponentProps, 'name'> &
  Omit<JSX.IntrinsicElements['input'], 'children'> &
  Omit<JSX.IntrinsicElements['textarea'], 'children'>

export function GiftCardInput(props: Props): JSX.Element {
  const { placeholder = '', ...p } = props
  return <BaseInput placeholder={placeholder} {...p} />
}

export default GiftCardInput
