import useExternalScript from '#utils/hooks/useExternalScript'
import { useEffect } from 'react'
import { PaymentSourceProps } from './PaymentSource'

interface Props {
  environment: 'test' | 'live'
  /**
   * Axerve merchant ID. ex: GESPAY*****
   */
  shopLogin: string
  /**
   * Axerve payment ID.
   */
  paymentId: string
  /**
   * Axerve payment token.
   */
  paymentToken: string
  /**
   * Should be a checkbox to check if the customer wants to save the payment.
   */
  templateCustomerSaveToWallet?: PaymentSourceProps['templateCustomerSaveToWallet']
}

export function AxervePayment({
  environment = 'test',
  shopLogin,
  paymentId,
  paymentToken
}: Props): JSX.Element | null {
  const scriptUrl =
    environment === 'live'
      ? process.env.AXERVE_PROD
      : process.env.AXERVE_SANDBOX
  const loaded = useExternalScript(scriptUrl)
  useEffect(() => {
    if (loaded) {
      window.axerve.lightBox.shop = shopLogin
      window.axerve.lightBox.open(paymentId, paymentToken, (res) => {
        if (res.status === 'OK') {
          console.log('Payment status ---- OK ----')
          // api.orders.update({
          // 	id: orderId,
          // 	_place: true
          // }).then((res) => {
          // 	console.log('Order updated', res)
          // 	debugger
          // }).catch((err) => {
          // 	console.error('Order updated error', err)
          // })
        } else {
          console.error('Payment error', res)
        }
      })
    }
  }, [loaded])

  return <></>
}

export default AxervePayment
