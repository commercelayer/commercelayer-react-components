import React, { FunctionComponent, Fragment, ReactNode, useRef } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent, BaseMetadata } from '../@types/index'

export interface GiftCardProps extends BaseComponent {
  children: ReactNode
  metadata?: BaseMetadata
}

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { children } = props
  const name = 'giftCardForm'
  const ref = useRef(null)
  const handleSubmit = (): void => {
    console.log('ref', ref)
    debugger
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
