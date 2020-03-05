import React, { FunctionComponent } from 'react'
import BaseInput, { BIProps, BaseInputProps } from './utils/BaseInput'

export type MetadataInputProps = BaseInputProps

const MetadataInput: FunctionComponent<MetadataInputProps> = props => {
  return <BaseInput data-metadata {...props} />
}

MetadataInput.propTypes = BIProps

export default MetadataInput
