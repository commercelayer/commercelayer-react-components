import BaseInput from '#components-utils/BaseInput'
import { BaseInputComponentProps } from '#typings'

type Props = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function MetadataInput(props: Props) {
  return <BaseInput data-metadata {...props} />
}

export default MetadataInput
