import React, { FunctionComponent, useContext, ChangeEvent } from 'react'
import BaseInput from './utils/BaseInput'
import ItemContext from '../context/ItemContext'
import SkuOptionChildrenContext from '../context/SkuOptionChildrenContext'
import { BOCProps } from './utils/BaseOrderPrice'
import { BaseInputProps } from './utils/BaseInput'

type HandleChange = (
  event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
) => void

const SkuOptionInput: FunctionComponent<BaseInputProps> = props => {
  const { name } = props
  const { option, setOption } = useContext(ItemContext)
  const { skuOption, skuCode } = useContext(SkuOptionChildrenContext)
  const handleChange: HandleChange = e => {
    const val = e.target.value
    const o = {
      [skuCode]: {
        ...option[skuCode],
        [skuOption.id]: {
          skuOptionId: skuOption.id,
          options: {
            [name]: val
          }
        }
      }
    }
    setOption(o)
  }
  return <BaseInput onChange={handleChange} {...props} />
}

SkuOptionInput.propTypes = BOCProps

export default SkuOptionInput
