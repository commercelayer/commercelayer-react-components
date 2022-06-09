import { FunctionComponent } from 'react'
import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'

const propTypes = components.MetadataInput.propTypes
const displayName = components.MetadataInput.displayName

export type MetadataInputProps = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const MetadataInput: FunctionComponent<MetadataInputProps> = (props) => {
  return <BaseInput data-metadata {...props} />
}

MetadataInput.propTypes = propTypes
MetadataInput.displayName = displayName

export default MetadataInput
