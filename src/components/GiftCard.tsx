import React, { FunctionComponent, Fragment, useRef, useContext } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { BaseComponent } from '../@types/index'
import validateFormFields from '../utils/validateFormFields'
import _ from 'lodash'
import GiftCardContext from '../context/GiftCardContext'
import { GiftCardI } from '../reducers/GiftCardReducer'

type RequiredFields = 'currencyCode' | 'balanceCents'

const GCProps = {
  children: PropTypes.node.isRequired,
  metadata: PropTypes.objectOf(PropTypes.string),
  onSubmit: PropTypes.func
}

export type GiftCardProps = InferProps<typeof GCProps> & BaseComponent

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { children, onSubmit } = props
  const name = 'giftCardForm'
  const ref = useRef(null)
  const { addGiftCard, addGiftCardError } = useContext(GiftCardContext)
  const handleSubmit = (e): void => {
    e.preventDefault()
    const { errors, values } = validateFormFields<RequiredFields[]>(
      ref.current.elements,
      ['currencyCode', 'balanceCents'],
      'giftCard'
    )
    if (_.isEmpty(errors)) {
      addGiftCard(values as GiftCardI)
      ref.current.reset()
      if (onSubmit) {
        onSubmit(values)
      }
    } else {
      addGiftCardError(errors)
    }
  }
  return (
    <Fragment>
      <form key={name} name={name} ref={ref} onSubmit={handleSubmit}>
        {children}
      </form>
    </Fragment>
  )
}

GiftCard.propTypes = GCProps

GiftCard.defaultProps = {
  onSubmit: null,
  metadata: {}
}

export default GiftCard
