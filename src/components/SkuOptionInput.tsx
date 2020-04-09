import React, { FunctionComponent, useContext, ChangeEvent } from 'react'
import BaseInput from './utils/BaseInput'
import ItemContext from '../context/ItemContext'
import SkuOptionChildrenContext from '../context/SkuOptionChildrenContext'
import _ from 'lodash'
import { ItemOptions } from '../reducers/ItemReducer'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.SkuOptionInput.propTypes
const displayName = components.SkuOptionInput.displayName

type HandleChange = (
  event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
) => void

type SkuOptionInputProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const SkuOptionInput: FunctionComponent<SkuOptionInputProps> = (props) => {
  const { name } = props
  const { option, setOption } = useContext(ItemContext)
  const { skuOption, skuCode } = useContext(SkuOptionChildrenContext)
  const handleChange: HandleChange = (e) => {
    const val = e.target.value
    const options = _.has(option, `${skuCode}.${skuOption?.id}`)
      ? option[skuCode][`${skuOption?.id}`]['options']
      : {}
    const o = {
      [skuCode]: {
        ...option[skuCode],
        [`${skuOption?.id}`]: {
          skuOptionId: skuOption?.id,
          options: {
            ...options,
            [name]: val,
          },
        },
      },
    } as ItemOptions
    setOption && setOption(o)
  }
  return <BaseInput onChange={handleChange} {...props} />
}

SkuOptionInput.propTypes = propTypes
SkuOptionInput.displayName = displayName

export default SkuOptionInput
