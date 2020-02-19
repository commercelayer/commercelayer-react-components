import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../@types/index'
import BaseInput, { BaseInputType } from './utils/BaseInput'

type GiftCardInputName =
  | 'balanceCents'
  | 'balanceMaxCents'
  | 'singleUse'
  | 'rechargeable'
  | 'imageUrl'
  | 'expiresAt'
  | 'referenceOrigin'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'reference'

export interface GiftCardInputProps extends BaseComponent {
  type: BaseInputType
  name: GiftCardInputName
  children?: FunctionComponent
  placeholder?: string
  required?: boolean
}

const GiftCardInput: FunctionComponent<GiftCardInputProps> = props => {
  const { ...p } = props
  return <BaseInput {...p} />
}

GiftCardInput.propTypes = {
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'email',
    'number',
    'date',
    'checkbox'
  ]).isRequired,
  name: PropTypes.oneOf<GiftCardInputName>([
    'balanceCents',
    'balanceMaxCents',
    'singleUse',
    'rechargeable',
    'imageUrl',
    'expiresAt',
    'referenceOrigin',
    'email',
    'firstName',
    'lastName',
    'reference'
  ]).isRequired,
  children: PropTypes.func,
  placeholder: PropTypes.string
}

export default GiftCardInput
