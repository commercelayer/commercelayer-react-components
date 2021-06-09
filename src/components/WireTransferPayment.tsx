import React, { FunctionComponent, ReactNode, Fragment } from 'react'

export type WireTransferConfig = {
  infoMessage: string | ReactNode
}

const defaultMessage =
  'after placing the order, you will need to manually complete the payment with your bank'

type Props = WireTransferConfig
const WireTransferPayment: FunctionComponent<Props> = ({
  infoMessage = defaultMessage,
}) => <Fragment>{infoMessage}</Fragment>

export default WireTransferPayment
