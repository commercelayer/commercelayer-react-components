import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../@types/index'
import BaseInput, { BaseInputType } from './utils/BaseInput'

export interface MetadataInputProps extends BaseComponent {
  name: string
  type: BaseInputType
  children?: FunctionComponent
  placeholder?: string
}

const MetadataInput: FunctionComponent<MetadataInputProps> = props => {
  return <BaseInput data-metadata {...props} />
}

MetadataInput.propTypes = {
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'textarea',
    'date',
    'email',
    'number',
    'checkbox'
  ]).isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.func,
  placeholder: PropTypes.string
}

export default MetadataInput
