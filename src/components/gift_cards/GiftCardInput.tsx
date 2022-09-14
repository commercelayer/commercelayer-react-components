import BaseInput from '#components-utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps, GiftCardInputName } from '#typings'

const propTypes = components.GiftCardInput.propTypes
const displayName = components.GiftCardInput.displayName

type Props = {
  name: GiftCardInputName
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function GiftCardInput(props: Props) {
  const { placeholder = '', ...p } = props
  return <BaseInput placeholder={placeholder} {...p} />
}

GiftCardInput.propTypes = propTypes
GiftCardInput.displayName = displayName

export default GiftCardInput
