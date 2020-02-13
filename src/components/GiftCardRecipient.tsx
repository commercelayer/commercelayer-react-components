import React, { FunctionComponent, Fragment, ReactNode, useRef } from 'react'
import PropTypes from 'prop-types'

export interface GiftCardRecipientProps {
  children: ReactNode
  id?: string
  customer?: object // Customer Collection
}

const GiftCardRecipient: FunctionComponent<GiftCardRecipientProps> = props => {
  const { children } = props
  const name = 'giftCardRecipientForm'
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

GiftCardRecipient.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  customer: PropTypes.object
}

export default GiftCardRecipient
