import React, { FunctionComponent, Fragment, ReactNode, useRef } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent, BaseMetadata } from '../@types/index'
import validateFormFields from '../utils/validateFormFields'
import _ from 'lodash'

type RequiredFields = 'currencyCode' | 'balanceCents'

export interface GiftCardProps extends BaseComponent {
  children: ReactNode
  metadata?: BaseMetadata
}

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { children } = props
  const name = 'giftCardForm'
  const ref = useRef(null)
  const handleSubmit = (e): void => {
    e.preventDefault()
    const { errors, values } = validateFormFields<RequiredFields[]>(
      ref.current.elements,
      ['currencyCode', 'balanceCents']
    )
    if (_.isEmpty(errors)) {
      debugger
      // TODO: ADD CALLBACK TO MANAGE THE EVENT
      // addGiftCardRecipient(values as GiftCardRecipientI)
      ref.current.reset()
    }
    console.log('errors', errors)
  }
  return (
    <Fragment>
      <form key={name} name={name} ref={ref} onSubmit={handleSubmit}>
        {children}
      </form>
    </Fragment>
  )
}

GiftCard.propTypes = {
  children: PropTypes.node.isRequired
}

export default GiftCard
