import React, { FunctionComponent, useContext, ChangeEvent } from 'react'
import PropTypes from 'prop-types'
import BaseInput, { BaseInputType } from './utils/BaseInput'
import { MetadataInputProps } from './MetadataInput'
import ItemContext from '../context/ItemContext'
import SkuOptionChildrenContext from '../context/SkuOptionChildrenContext'

type HandleChange = (
  event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
) => void

const SkuOptionInput: FunctionComponent<MetadataInputProps> = props => {
  const { name } = props
  const { option, setOption } = useContext(ItemContext)
  const { skuOption, skuCode } = useContext(SkuOptionChildrenContext)
  const handleChange: HandleChange = e => {
    const val = e.target.value
    const o = {
      ...option,
      [skuCode]: {
        skuOptionId: skuOption.id,
        options: {
          [name]: val
        }
      }
    }
    setOption(o)
  }
  return <BaseInput onChange={handleChange} {...props} />
}

SkuOptionInput.propTypes = {
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

export default SkuOptionInput
