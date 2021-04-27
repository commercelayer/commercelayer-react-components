import React, { FunctionComponent, useEffect } from 'react'
import braintree from 'braintree-web'

type BraintreePaymentProps = {
  authorization: string
}

const BraintreePayment: FunctionComponent<BraintreePaymentProps> = ({
  authorization,
}) => {
  useEffect(() => {
    if (authorization) {
      braintree.client.create(
        { authorization },
        (clientErr, clientInstance) => {
          if (clientErr) {
            console.error(clientErr)
            return
          }
          braintree.hostedFields.create(
            {
              client: clientInstance,
              styles: {
                input: {
                  'font-size': '14px',
                },
                'input.invalid': {
                  color: 'red',
                },
                'input.valid': {
                  color: 'green',
                },
              },
              fields: {
                number: {
                  selector: '#card-number',
                  placeholder: '4111 1111 1111 1111',
                },
                cvv: {
                  selector: '#cvv',
                  placeholder: '123',
                },
                expirationDate: {
                  selector: '#expiration-date',
                  placeholder: '10/2022',
                },
              },
            },
            (hostedFieldsErr, hostedFieldsInstance) => {
              if (hostedFieldsErr) {
                console.error(hostedFieldsErr)
                return
              }
            }
          )
        }
      )
    }
    // return () => {
    //   cleanup
    // }
  }, [authorization])
  return !authorization ? null : (
    <div>
      <form action="/" id="my-sample-form" method="post">
        <label htmlFor="card-number">Card Number</label>
        <div id="card-number"></div>

        <label htmlFor="cvv">CVV</label>
        <div id="cvv"></div>

        <label htmlFor="expiration-date">Expiration Date</label>
        <div id="expiration-date"></div>

        <input type="submit" value="Pay" disabled />
      </form>
    </div>
  )
}

export default BraintreePayment
