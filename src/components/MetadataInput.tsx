import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'

const propTypes = components.MetadataInput.propTypes
const displayName = components.MetadataInput.displayName

type Props = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function MetadataInput(props: Props) {
  return <BaseInput data-metadata {...props} />
}

MetadataInput.propTypes = propTypes
MetadataInput.displayName = displayName

export default MetadataInput
