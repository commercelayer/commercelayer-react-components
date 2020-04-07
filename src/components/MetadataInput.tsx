import React, { FunctionComponent } from 'react'
import BaseInput from './utils/BaseInput'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.MetadataInput.propTypes
const displayName = components.MetadataInput.displayName

export type MetadataInputProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const MetadataInput: FunctionComponent<MetadataInputProps> = (props) => {
  return <BaseInput data-metadata {...props} />
}

MetadataInput.propTypes = propTypes
MetadataInput.displayName = displayName

export default MetadataInput
