import React, {
  FunctionComponent,
  Fragment,
  ReactNode,
  useRef,
  useContext
} from 'react'
import PropTypes from 'prop-types'
import { BaseComponent, BaseMetadata } from '../@types/index'
import validateFormFields from '../utils/validateFormFields'
import _ from 'lodash'
import GiftCardContext from '../context/GiftCardContext'
import { GiftCardI } from '../reducers/GiftCardReducer'

type RequiredFields = 'currencyCode' | 'balanceCents'

export interface GiftCardProps extends BaseComponent {
  children: ReactNode
  metadata?: BaseMetadata
}
// TODO: add onSubmit prop with callback
const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { children } = props
  const name = 'giftCardForm'
  const ref = useRef(null)
  const { addGiftCard } = useContext(GiftCardContext)
  const handleSubmit = (e): void => {
    e.preventDefault()
    const { errors, values } = validateFormFields<RequiredFields[]>(
      ref.current.elements,
      ['currencyCode', 'balanceCents']
    )
    if (_.isEmpty(errors)) {
      addGiftCard(values as GiftCardI)
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
