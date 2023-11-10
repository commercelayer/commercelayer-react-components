import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import { OrderStorage } from '../../_internals/OrderStorage'
import Errors from '#components/errors/Errors'
import { persistKey } from './utils'
import { PaymentMethod } from '#components/payment_methods/PaymentMethod'
import { PaymentMethodPrice } from '#components/payment_methods/PaymentMethodPrice'
import { PaymentMethodName } from '#components/payment_methods/PaymentMethodName'
import { PaymentMethodRadioButton } from '#components/payment_methods/PaymentMethodRadioButton'
import { PaymentMethodsContainer } from '#components/payment_methods/PaymentMethodsContainer'
import { PaymentSource } from '#components/payment_source/PaymentSource'
import { PaymentSourceBrandIcon } from '#components/payment_source/PaymentSourceBrandIcon'
import { PaymentSourceBrandName } from '#components/payment_source/PaymentSourceBrandName'
import { PaymentSourceDetail } from '#components/payment_source/PaymentSourceDetail'
import { PaymentSourceEditButton } from '#components/payment_source/PaymentSourceEditButton'
import { PlaceOrderButton } from '#components/orders/PlaceOrderButton'
import { PlaceOrderContainer } from '#components/orders/PlaceOrderContainer'
import { PrivacyAndTermsCheckbox } from '#components/orders/PrivacyAndTermsCheckbox'
import { useState } from 'react'

const setup: Meta = {
  title: 'Examples/Checkout Page/Payment Methods'
}

export default setup

export const PaymentMethods: StoryFn = () => {
  const [isPlaced, setIsPlaced] = useState(false)
  return (
    <CommerceLayer accessToken='my-access-token'>
      <OrderStorage persistKey={persistKey}>
        <OrderContainer
          attributes={{
            privacy_url: 'https://www.demo-store.com/privacy-policy',
            terms_url: 'https://www.demo-store.com/terms-and-conditions'
          }}
          fetchOrder={(order) => {
            if (order.status === 'placed') {
              setIsPlaced(true)
            }
          }}
        >
          {isPlaced ? (
            <SampleThankYouPage />
          ) : (
            <>
              <PaymentMethodsContainer
                config={{
                  stripePayment: {
                    appearance: {},
                    containerClassName: 'flex-1 pl-4',
                    options: {}
                  },
                  adyenPayment: {
                    placeOrderCallback: (data) => {
                      if (data.placed) {
                        setIsPlaced(true)
                      }
                    }
                  }
                }}
              >
                <PlaceOrderContainer
                  // optional configuration
                  options={
                    {
                      // paypalPayerId: 'string',
                      // adyen: {},
                      // stripe: {}
                    }
                  }
                >
                  <PaymentMethod
                    hide={['klarna_payments']} // optional array of payment sources to hide
                    className='p-4 mb-4 flex items-center justify-items-center border-2 rounded-md cursor-pointer hover:bg-gray-100'
                    activeClass='border-green-500'
                    clickableContainer
                  >
                    <PaymentMethodRadioButton className='cursor-pointer' />
                    <PaymentMethodName className='block pl-3' />
                    <PaymentMethodPrice className='block pl-3' />
                    <PaymentSource className='p-5 my-2'>
                      <div className='flex flex-row items-center justify-start bg-gray-100 p-5 my-10'>
                        <div className='flex flex-row items-center'>
                          <PaymentSourceBrandIcon className='mr-3' />
                          <PaymentSourceBrandName className='mr-1' />
                          ending in
                          <PaymentSourceDetail className='ml-1' type='last4' />
                        </div>
                        <div className='text-gray-500 ml-5'>
                          <PaymentSourceDetail type='exp_month' />
                          <PaymentSourceDetail type='exp_year' />
                        </div>
                        <div className='ml-5'>
                          <PaymentSourceEditButton className='text-blue-500 hover:underline hover:text-blue-600' />
                        </div>
                      </div>
                    </PaymentSource>
                    <Errors
                      className='text-red-600 block'
                      resource='payment_methods'
                    />
                  </PaymentMethod>

                  <div className='  mb-4'>
                    <label
                      htmlFor='privacy-terms'
                      className='block ml-2 self-end'
                    >
                      <PrivacyAndTermsCheckbox
                        id='privacy-terms'
                        className='disabled:opacity-50 mr-2'
                      />
                      Accept privacy and terms
                    </label>
                  </div>
                  <PlaceOrderButton
                    onClick={(data) => {
                      if (data.placed) {
                        alert('Order has been placed -> show thank you page')
                      }
                    }}
                    className='px-3 py-2 rounded bg-green-500 text-white disabled:opacity-50'
                  />
                </PlaceOrderContainer>
              </PaymentMethodsContainer>
              <div className='flex flex-col text-red-600 mt-5'>
                <Errors resource='orders' />
              </div>
            </>
          )}
        </OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

const SampleThankYouPage: React.FC = () => {
  return (
    <div className='p-8 bg-green-600 rounded text-white text-2xl'>
      <p>Thank you!</p>
      <p>Your order has been successfully placed</p>
    </div>
  )
}
