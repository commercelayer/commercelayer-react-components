import React, {
  FormEvent,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import braintree from 'braintree-web'
import { HostedFieldFieldOptions } from 'braintree-web/modules/hosted-fields'
import PaymentMethodContext from '#context/PaymentMethodContext'
import isEmpty from 'lodash/isEmpty'

type BraintreeHostedFields<Type> = {
  [Property in keyof Type]: {
    label?: string
  } & Type[Property]
}

export type BraintreeConfig = {
  styles?: {
    [key: string]: Record<string, string>
  }
  fields?: BraintreeHostedFields<HostedFieldFieldOptions>
}

type BraintreePaymentProps = {
  authorization: string
  config?: BraintreeConfig
}

const defaultConfig: BraintreeConfig = {
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
      label: 'Card Number',
      selector: '#card-number',
      placeholder: '4111 1111 1111 1111',
    },
    cvv: {
      label: 'CVV',
      selector: '#cvv',
      placeholder: '123',
    },
    expirationDate: {
      label: 'Expiration Date',
      selector: '#expiration-date',
      placeholder: '10/2022',
    },
  },
}

const BraintreePayment: FunctionComponent<BraintreePaymentProps> = ({
  authorization,
  config = defaultConfig,
}) => {
  const { fields, styles } = config
  const [loadBraintree, setloadBraintree] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [hostedFieldsInstance, setHostedFieldsInstance] = useState<any>()
  const { setPaymentSource, paymentSource } = useContext(PaymentMethodContext)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (hostedFieldsInstance) {
      hostedFieldsInstance.tokenize((tokenizeErr: any, payload: any) => {
        if (tokenizeErr) {
          console.error(tokenizeErr)
          return
        }
        if (paymentSource) {
          setPaymentSource({
            paymentSourceId: paymentSource.id,
            paymentResource: 'BraintreePayment',
            attributes: {
              paymentMethodNonce: payload.nonce,
              options: {
                last4: payload.details.lastFour,
                expYear: payload.details.expirationYear,
                expMonth: payload.details.expirationMonth,
                brand: payload.details.cardType,
              },
            },
          })
        }
      })
    }
  }
  useEffect(() => {
    if (authorization && !loadBraintree && !isEmpty(window)) {
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
              fields: fields as HostedFieldFieldOptions,
              styles: styles,
            },
            (hostedFieldsErr, hostedFieldsInstance) => {
              if (hostedFieldsErr) {
                console.error(hostedFieldsErr)
                return
              }
              setloadBraintree(true)
              setButtonDisabled(false)
              setHostedFieldsInstance(hostedFieldsInstance)
            }
          )
        }
      )
    }
    return () => {
      setloadBraintree(false)
    }
  }, [authorization])
  return !authorization && !loadBraintree ? null : (
    <div>
      <form id="braintree-form" onSubmit={handleSubmit}>
        <label htmlFor="card-number">{fields?.number.label}</label>
        <div id="card-number"></div>

        <label htmlFor="cvv">{fields?.cvv.label}</label>
        <div id="cvv"></div>

        <label htmlFor="expiration-date">{fields?.expirationDate?.label}</label>
        <div id="expiration-date"></div>

        <input type="submit" value="Pay" disabled={buttonDisabled} />
      </form>
    </div>
  )
}

export default BraintreePayment
