import React, { FunctionComponent } from 'react'
import BaseInput from './utils/BaseInput'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.GiftCardInput.propTypes
const displayName = components.GiftCardInput.displayName

export type GiftCardInputProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const GiftCardInput: FunctionComponent<GiftCardInputProps> = (props) => {
  const { placeholder, ...p } = props
  return <BaseInput placeholder={placeholder || ''} {...p} />
}

GiftCardInput.propTypes = propTypes
GiftCardInput.displayName = displayName

export default GiftCardInput
