import { useContext } from 'react'
import BaseInput from '../utils/BaseInput'
import ItemContext from '#context/ItemContext'
import SkuOptionChildrenContext from '#context/SkuOptionChildrenContext'
import has from 'lodash/has'
import { ItemOptions } from '#reducers/ItemReducer'
import components from '#config/components'
import { BaseInputComponentProps } from '#typings'

const propTypes = components.SkuOptionInput.propTypes
const displayName = components.SkuOptionInput.displayName

type Props = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function SkuOptionInput(props: Props) {
  const { name } = props
  const { option, setOption } = useContext(ItemContext)
  const { skuOption, skuCode } = useContext(SkuOptionChildrenContext)
  const handleChange: BaseInputComponentProps['onChange'] = (event) => {
    const val = event.target.value
    const options = has(option, `${skuCode}.${skuOption?.id}`)
      ? option[skuCode]?.[`${skuOption?.id}`]?.['options']
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
