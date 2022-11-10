// import React from 'react'
// import PropTypes from 'prop-types'
// import { FunctionComponent } from 'react'
// import BaseInput from '#components-utils/BaseInput'
// import { BaseComponent } from '#typings/index'

// type NameType =
//   | 'email'
//   | 'firstName'
//   | 'lastName'
//   | 'referenceOrigin'
//   | 'reference'

// type TypeType = 'email' | 'text'

// export interface GiftCardRecipientInputProps extends BaseComponent {
//   name: NameType
//   type: TypeType
//   children?: FunctionComponent
//   placeholder?: string
//   required?: boolean
// }

// const GiftCardRecipientInput: FunctionComponent<GiftCardRecipientInputProps> = props => {
//   const forceRequired = {
//     required: props.type === 'email' ? true : props.required
//   }
//   return <BaseInput {...props} {...forceRequired} />
// }

// GiftCardRecipientInput.propTypes = {
//   name: PropTypes.oneOf<NameType>([
//     'email',
//     'firstName',
//     'lastName',
//     'referenceOrigin',
//     'reference'
//   ]).isRequired,
//   type: PropTypes.oneOf<TypeType>(['email', 'text']).isRequired,
//   placeholder: PropTypes.string,
//   required: PropTypes.bool
// }

// export default GiftCardRecipientInput
